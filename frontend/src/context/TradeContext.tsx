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
            // If the name or description is changing, clear the old HS code
            const isProductChanging = (data.name !== undefined && data.name !== prev.name) || 
                                     (data.description !== undefined && data.description !== prev.description);
            const clearHs = isProductChanging ? { hsCode: null } : {};
            
            const newState = { ...prev, ...data, ...clearHs };
            return newState;
        });
    };

    const clearTradeData = () => {
        setState(defaultState);
    };

    // Prevent hydration mismatch by not rendering or rendering default until mounted
    // However, rendering children is fine, it just might flash default values
    if (!mounted) {
        return <TradeContext.Provider value={{ ...defaultState, setTradeData, clearTradeData }}>{children}</TradeContext.Provider>;
    }

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
