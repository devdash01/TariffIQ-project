"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type TradeContextType = {
    // Raw form data matching what's in trade-input
    name: string;
    category: string;
    description: string;
    material: string;
    intendedUse: string;
    value: string;
    currency: string;
    qty: string;
    weight: string;
    dimensions: string;
    origin: string;
    dest: string;
    transport: string;
    manualHsCode: string;

    // Computed data / pipeline state
    hsCode: string | null;
    scenarios: any[];
    landedCost: any | null;

    // Setters
    setTradeData: (data: Partial<Omit<TradeContextType, "setTradeData" | "clearTradeData">>) => void;
    clearTradeData: () => void;
};

const defaultState: Omit<TradeContextType, "setTradeData" | "clearTradeData"> = {
    name: "",
    category: "Select category",
    description: "",
    material: "",
    intendedUse: "",
    value: "",
    currency: "USD - US Dollar",
    qty: "",
    weight: "",
    dimensions: "",
    origin: "Select origin",
    dest: "Select destination",
    transport: "Select transport mode",
    manualHsCode: "",
    hsCode: null,
    scenarios: [],
    landedCost: null,
};

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState(defaultState);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage on mount (DISABLED for clean starts)
    useEffect(() => {
        setMounted(true);
    }, []);

    const setTradeData = (data: Partial<Omit<TradeContextType, "setTradeData" | "clearTradeData">>) => {
        setState((prev) => {
            // Only clear HS code if name or description actually CHANGES to a different non-empty value
            const nameChanged = data.name !== undefined && data.name !== prev.name && data.name.trim() !== "";
            const descChanged = data.description !== undefined && data.description !== prev.description && data.description.trim() !== "";
            
            const isProductChanging = nameChanged || descChanged;
            const clearHs = isProductChanging ? { hsCode: null, landedCost: null } : {};
            
            const newState = { ...prev, ...data, ...clearHs };
            return newState;
        });
    };

    const clearTradeData = () => {
        setState(defaultState);
    };

    // Prevent hydration mismatch by not rendering or rendering default until mounted
    // However, rendering children is fine, it just might flash default values
    // Automatic Pipeline: Triggers HS detection and Landed Cost when data is sufficient
    useEffect(() => {
        if (!mounted) return;
        const { origin, dest, value, qty, weight, name, description, hsCode, transport } = state;
        
        // Requirements for calculation
        const hasBaseData = name && origin !== "Select origin" && dest !== "Select destination" && value && qty && weight;
        if (!hasBaseData) return;

        // 1. Auto-detect HS Code if missing
        const detectHs = async () => {
            if (state.hsCode || !state.name) return;
            try {
                const res = await fetch("/api/classify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_description: state.description || state.name, destination: state.dest })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.primary_hs) {
                        setTradeData({ hsCode: data.primary_hs });
                    }
                }
            } catch (e) { console.error("Auto-HS failed", e); }
        };

        // 2. Auto-calculate Landed Cost if HS Code is available
        const calcLandedCost = async () => {
            if (!state.hsCode) return;
            try {
                const unitPrice = Number(state.value?.replace(/[^0-9.-]+/g, "")) || 0;
                const quantity = Number(state.qty?.replace(/[^0-9.-]+/g, "")) || 1;
                const totalValue = unitPrice * quantity;

                const res = await fetch("/api/landed-cost", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_description: state.description || state.name,
                        origin: state.origin,
                        destination: state.dest,
                        mode: (state.transport || "").toLowerCase().includes("air") ? "air" : "sea",
                        weight_kg: Number(state.weight?.replace(/[^0-9.-]+/g, "")) || 1,
                        product_value: totalValue,
                        hs_code: state.hsCode,
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.landed_cost) {
                        setState(prev => ({ ...prev, landedCost: data.landed_cost, scenarios: data.scenarios || [] }));
                    }
                }
            } catch (e) { console.error("Auto-LandedCost failed", e); }
        };

        const runPipeline = async () => {
            if (!state.hsCode) {
                await detectHs();
            } else {
                await calcLandedCost();
            }
        };

        const timer = setTimeout(runPipeline, 1000); // Debounce
        return () => clearTimeout(timer);
    }, [state.name, state.origin, state.dest, state.value, state.qty, state.weight, state.hsCode, state.transport]);

    return (
        <TradeContext.Provider value={{ ...state, setTradeData, clearTradeData }}>
            {children}
        </TradeContext.Provider>
    );
}

export function useTradeContext() {
    const context = useContext(TradeContext);
    if (context === undefined) {
        throw new Error("useTradeContext must be used within a TradeProvider");
    }
    return context;
}
