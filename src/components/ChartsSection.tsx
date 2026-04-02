"use client";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    LineChart, Line, Legend,
} from "recharts";

const pieData = [
    { name: "Product Cost", value: 71, color: "#3b82f6" },
    { name: "Customs Duty", value: 9, color: "#a855f7" },
    { name: "Import Tax", value: 6, color: "#06b6d4" },
    { name: "Freight", value: 11, color: "#10b981" },
    { name: "Insurance", value: 2, color: "#f59e0b" },
    { name: "Handling", value: 1, color: "#f43f5e" },
];

const barData = [
    { route: "China→United States Sea", cost: 13500 },
    { route: "Vietnam→United States Sea", cost: 12100 },
    { route: "China→United States Air", cost: 18000 },
    { route: "India→United States Sea", cost: 11500 },
];

const TICK_STYLE = { fontSize: 11, fill: "#64748b" };
const GRID_STROKE = "rgba(0,0,0,0.06)";

const CustomTooltip = ({ active, payload, label }: any) => {
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
            {label && <div style={{ fontWeight: 700, marginBottom: 4, color: "var(--text-muted)" }}>{label}</div>}
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name ?? ""} {p.name ? ":" : ""} {typeof p.value === "number" ? `$${p.value.toLocaleString()}` : p.value}
                </div>
            ))}
        </div>
    );
};

const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#0f172a", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <span style={{ color: payload[0].payload.color, fontWeight: 700 }}>{payload[0].name}</span>
            <span style={{ marginLeft: 6, color: "var(--text-muted)" }}>{payload[0].value}%</span>
        </div>
    );
};

export function ChartsSection() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* ── PIE CHART ─────────────────────────── */}
            <div className="glass-card card-shadow accent-top animate-fade-in-up delay-200" style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                        Landed Cost Breakdown
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                        Total cost composition for current trade route
                    </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 180, height: 180, flexShrink: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={52}
                                    outerRadius={78}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                        {pieData.map((d) => (
                            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                                <div style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}>{d.name}</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{d.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── BAR CHART ─────────────────────────── */}
            <div className="glass-card card-shadow accent-top animate-fade-in-up delay-300" style={{ padding: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                        Route Cost Comparison
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                        Optimized alternatives vs. current route
                    </div>
                </div>
                <div style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} barSize={32}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
                            <XAxis dataKey="route" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="cost" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Landed Cost" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Highlight best */}
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ color: "var(--text-muted)" }}>Best:</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>India→United States Sea — $11,500</span>
                    <span style={{ marginLeft: "auto", color: "var(--success)", fontWeight: 600, fontSize: 11, background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(16,185,129,0.2)" }}>
                        -15% savings
                    </span>
                </div>
            </div>

        </div>
    );
}