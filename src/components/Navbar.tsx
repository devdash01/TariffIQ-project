"use client";
import { Bell, Search, RefreshCw } from "lucide-react";

export default function TopBar({ title = "Dashboard" }: { title?: string }) {
    return (
        <div
            className="animate-fade-in"
            style={{
                height: 72,
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                background: "var(--bg-surface)",
                flexShrink: 0,
            }}
        >
            {/* Left: breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15, color: "var(--text-muted)", fontWeight: 600 }}>TariffIQ</span>
                <span style={{ color: "var(--text-subtle)", fontSize: 15 }}>/</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{title}</span>
                <span
                    style={{
                        marginLeft: 10,
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: 99,
                        background: "rgba(16,185,129,0.12)",
                        color: "#10b981",
                        border: "1px solid rgba(16,185,129,0.25)",
                    }}
                >
                    ● Live
                </span>
            </div>

            {/* Right: search + refresh + bell */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Search */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(0,0,0,0.04)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "9px 16px",
                        cursor: "text",
                    }}
                >
                    <Search size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>Search HS codes…</span>
                    <kbd
                        style={{
                            marginLeft: 10,
                            fontSize: 12,
                            padding: "2px 7px",
                            borderRadius: 5,
                            background: "rgba(0,0,0,0.05)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)",
                            fontWeight: 600,
                        }}
                    >
                        ⌘K
                    </kbd>
                </div>

                {/* Last updated */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)" }}>
                    <RefreshCw size={14} className="animate-spin-slow" />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Updated 2s ago</span>
                </div>

                {/* Bell */}
                <button
                    style={{
                        position: "relative",
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(0,0,0,0.04)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                    }}
                >
                    <Bell size={18} />
                    <span
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#f43f5e",
                            border: "2px solid var(--bg-surface)",
                        }}
                    />
                </button>
            </div>
        </div>
    );
}