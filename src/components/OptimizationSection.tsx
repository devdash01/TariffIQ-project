"use client";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Sparkles, TrendingDown, ShieldCheck, ArrowRight } from "lucide-react";

const trendData = [
    { month: "Sep", actual: 14200, optimized: 13800 },
    { month: "Oct", actual: 14800, optimized: 13200 },
    { month: "Nov", actual: 15100, optimized: 12900 },
    { month: "Dec", actual: 15600, optimized: 12400 },
    { month: "Jan", actual: 14900, optimized: 11900 },
    { month: "Feb", actual: 13500, optimized: 11500 },
];

const recommendations = [
    {
        icon: TrendingDown,
        title: "Switch to Vietnam → United States Sea Route",
        detail: "Est. savings of $1,400 per shipment — 10.4% reduction in landed cost",
        badge: "−$1,400",
    },
    {
        icon: ShieldCheck,
        title: "Apply GSP Duty Exemption",
        detail: "Product HS 8471.30 qualifies — eliminates 3.5% import duty entirely",
        badge: "−3.5% duty",
    },
    {
        icon: Sparkles,
        title: "Consolidate Freight with Partner SKUs",
        detail: "Bundle 2 co-origin SKUs to cut per-unit freight cost by $320",
        badge: "−$320/unit",
    },
];

const TICK = { fontSize: 11, fill: "#64748b" };
const GRID = "rgba(0,0,0,0.06)";

const DarkTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: "#0f172a",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}>
            <div style={{ fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>
                    {p.name}: ${p.value.toLocaleString()}
                </div>
            ))}
        </div>
    );
};

export function OptimizationSection() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            {/* ── TREND CHART ─────────────────────────── */}
            <div className="glass-card card-shadow animate-fade-in-up delay-300" style={{ padding: 24 }}>
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                        Landed Cost Trend
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                        Actual vs. AI-optimized trajectory over 6 months
                    </div>
                </div>
                <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
                            <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={42} />
                            <Tooltip content={<DarkTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 12 }} />
                            <Line type="monotone" dataKey="actual" name="Actual Cost" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                            <Line type="monotone" dataKey="optimized" name="Optimized" stroke="#2563eb" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div
                    style={{
                        marginTop: 16,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                    }}
                >
                    <span style={{ color: "var(--text-muted)" }}>Projected annual saving at optimized rate</span>
                    <span style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>$22,800</span>
                </div>
            </div>

            {/* ── AI RECOMMENDATIONS ───────────────────── */}
            <div className="glass-card card-shadow animate-fade-in-up delay-400" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 0 }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Sparkles size={14} color="#3b82f6" />
                        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                            AI Recommendations
                        </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                        Top actions to reduce landed cost &amp; risk
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {recommendations.map((rec, i) => (
                        <div
                            key={i}
                            className="shimmer-hover"
                            style={{
                                padding: "12px 14px",
                                borderRadius: 10,
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border)",
                                cursor: "pointer",
                                transition: "border-color 0.18s, transform 0.18s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)";
                                (e.currentTarget as HTMLElement).style.transform = "translateX(3px)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                                (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <div style={{ color: "#3b82f6", marginTop: 1, flexShrink: 0 }}>
                                    <rec.icon size={14} strokeWidth={2} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35, marginBottom: 3 }}>
                                        {rec.title}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                                        {rec.detail}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        flexShrink: 0,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "3px 7px",
                                        borderRadius: 99,
                                        background: "rgba(59,130,246,0.1)",
                                        color: "#60a5fa",
                                        border: "1px solid rgba(59,130,246,0.2)",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {rec.badge}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    style={{
                        marginTop: 14,
                        width: "100%",
                        padding: "10px 0",
                        borderRadius: 9,
                        background: "#2563eb",
                        border: "none",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
                >
                    Apply All Recommendations
                    <ArrowRight size={14} />
                </button>
            </div>

        </div>
    );
}
