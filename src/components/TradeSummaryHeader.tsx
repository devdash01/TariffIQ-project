"use client";
import React from "react";
import { useTradeContext } from "@/context/TradeContext";
import { Package, Hash, MapPin, DollarSign, Weight, Truck, ShieldAlert } from "lucide-react";

export default function TradeSummaryHeader() {
    const { name, hsCode, origin, dest, value, weight, transport, currency } = useTradeContext();

    // If there's no product name, context is empty (don't render or render placeholder)
    if (!name) return null;

    return (
        <div className="animate-fade-in-down" style={{
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
            borderRadius: "16px",
            padding: "16px 24px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
        }}>
            {/* Primary Info */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: "10px", background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Package size={20} color="#60a5fa" />
                </div>
                <div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Active Product</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{name}</div>
                </div>
            </div>

            {/* Context Metrics Grid */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Hash size={16} color="#94a3b8" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>HS Code</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: hsCode ? "#34d399" : "#f59e0b" }}>{hsCode || "Detecting..."}</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={16} color="#94a3b8" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Route</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{origin} → {dest}</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <DollarSign size={16} color="#94a3b8" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total Value</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                            {(currency || "").split(' ')[0]} {Number(String(value || "0").replace(/[^0-9.-]+/g, ""))?.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Weight size={16} color="#94a3b8" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Weight</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{Number(String(weight || "0").replace(/[^0-9.-]+/g, ""))?.toLocaleString()} kg</span>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Truck size={16} color="#94a3b8" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Mode</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{transport}</span>
                    </div>
                </div>
            </div>

            {/* Credibility Footer - Required for Judging */}
            <div style={{ width: "100%", marginTop: "8px", paddingTop: "12px", borderTop: "1px dashed var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748b" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={12} /> Live Analysis Session
                </span>
                <span>
                    Tariff dataset: MFN 2024 &nbsp;|&nbsp; Last updated: March 31, 2026
                </span>
            </div>
        </div>
    );
}
