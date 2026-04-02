"use client";
import PageShell from "@/components/PageShell";
import TradeSummaryHeader from "@/components/TradeSummaryHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Calculator, FileText, Ship, Plane, RefreshCw, Zap } from "lucide-react";
import { useTradeContext } from "@/context/TradeContext";
import { API_ENDPOINTS } from "@/config/api";
import { useEffect, useState } from "react";

const highlightStyle = {
    blue: { bg: "#eff6ff", border: "#bfdbfe", left: "#2563eb", textColor: "#2563eb" },
    purple: { bg: "#faf5ff", border: "#ddd6fe", left: "#7c3aed", textColor: "#7c3aed" },
    green: { bg: "#f0fdf4", border: "#bbf7d0", left: "#059669", textColor: "#059669" },
    base: { bg: "var(--bg-base)", border: "var(--border)", left: "transparent", textColor: "var(--text-primary)" }
} as const;

const fmt = (n: any) => {
    const val = Number(n);
    if (isNaN(val)) return "$0";
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function LandedCost() {
    const { name, origin, dest, value, weight, transport, hsCode, description, setTradeData } = useTradeContext();
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState<any>(null);
    const [scenarios, setScenarios] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // What-if simulation state
    const [simulatedTariffRate, setSimulatedTariffRate] = useState<number | null>(null);

    useEffect(() => {
        if (!origin || !dest || !value || origin === "Select origin" || dest === "Select destination") return;

        const fetchCost = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(API_ENDPOINTS.LANDED_COST, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_description: description || name || "Product",
                        origin: origin,
                        destination: dest,
                        mode: (transport || "").toLowerCase().includes("air") ? "air" : "sea",
                        weight_kg: Number(weight?.replace(/[^0-9.-]+/g, "")) || 1,
                        product_value: Number(value?.replace(/[^0-9.-]+/g, "")) || 0,
                        hs_code: hsCode,
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data?.landed_cost) {
                        setApiData(data.landed_cost);
                        setScenarios(data.scenarios || []);
                        setTradeData({ landedCost: data.landed_cost, scenarios: data.scenarios || [] });
                    } else {
                        throw new Error("Invalid response structure from engine");
                    }
                } else {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData?.detail || "Engine calculation failed");
                }
            } catch (err: any) {
                console.error("Failed to fetch landed cost:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCost();
    }, [name, origin, dest, value, weight, transport, hsCode, description]);

    if (!value && !loading && !apiData) {
        return (
            <PageShell title="Landed Cost">
                <TradeSummaryHeader />
                <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: 36, textAlign: "center", marginTop: 20 }}>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Please enter product and routing details in the Trade Input page first.</p>
                </div>
            </PageShell>
        );
    }

    // Unified data object with safe defaults
    const d = {
        product_value: Number(value?.replace(/[^0-9.-]+/g, "")) || 0,
        shipping_cost: 0,
        insurance_cost: 0,
        cif_value: 0,
        tariff_rate: 0,
        import_duty: 0,
        import_vat: 0,
        gst_cost: 0,
        cess_cost: 0,
        handling_fees: 0,
        doc_fees: 0,
        total_landed_cost: 0,
        distance_km: 0,
        weight_kg: Number(weight?.replace(/[^0-9.-]+/g, "")) || 1,
        mode: "sea",
        ...(apiData || {})
    };

    // Derived values
    const baseTariffRate = (Number(d.tariff_rate) || 0);
    const activeTariffRate = simulatedTariffRate !== null ? simulatedTariffRate : baseTariffRate;

    // Recalculate duties and taxes if we are simulating a different tariff rate
    let activeDuty = d.import_duty;
    let activeVat = d.import_vat;
    let activeGst = d.gst_cost;
    let activeCess = d.cess_cost;
    let activeTotal = d.total_landed_cost;

    if (simulatedTariffRate !== null) {
        activeDuty = d.cif_value * (activeTariffRate / 100);
        const dutiableValue = d.cif_value + activeDuty + activeCess;
        activeVat = dutiableValue * 0.12;
        activeGst = dutiableValue * 0.08;
        activeTotal = d.cif_value + activeDuty + activeVat + activeGst + activeCess + d.handling_fees + d.doc_fees;
    }

    const costPerUnit = activeTotal / (d.weight_kg || 1); // treating kg as unit for sim

    // Optimization math relative to best alternative scenario
    let bestScenario = d;
    if (scenarios.length > 0) {
        bestScenario = scenarios.reduce((prev, curr) => curr.total_landed_cost < prev.total_landed_cost ? curr : prev, d);
    }
    const savings = Math.max(0, activeTotal - bestScenario.total_landed_cost);
    const savingsPct = activeTotal > 0 ? (savings / activeTotal) * 100 : 0;

    const COST_ITEMS = [
        { label: "Product Base Cost", sub: "FOB value of goods", amount: d.product_value, highlight: "blue", icon: null },
        { label: `Freight Cost (${d.mode === "air" ? "Air" : "Sea"})`, sub: `${d.mode === "air" ? "5" : "30"} days transit time`, amount: d.shipping_cost, highlight: "green", icon: d.mode === "air" ? "plane" : "ship" },
        { label: "Insurance Cost", sub: "3% of Product Base Cost", amount: d.insurance_cost, highlight: "base", icon: null },
        { label: "CIF Value (Taxable Basis)", sub: "Cost + Insurance + Freight", amount: d.cif_value, highlight: "purple", icon: null },
        { label: "Customs Duty", sub: hsCode ? `HS ${hsCode} @ ${activeTariffRate.toFixed(1)}%` : `Tariff Rate: ${activeTariffRate.toFixed(1)}%`, amount: activeDuty, highlight: "purple", icon: null, note: `${activeTariffRate.toFixed(1)}% of CIF` },
        { label: "Import VAT/GST", sub: "Standard rate 12%", amount: activeVat, highlight: "base", icon: null, note: "12% of (CIF + Duty + Cess)" },
        { label: "GST (Goods & Services Tax)", sub: "Additional 8%", amount: activeGst, highlight: "base", icon: null, note: "8% of (CIF + Duty + Cess)" },
        { label: "Additional Cess/Surcharge", sub: "Special levy 1.5%", amount: activeCess, highlight: "base", icon: null, note: "1.5% of CIF" },
        { label: "Port Handling Fees", sub: "", amount: d.handling_fees, highlight: "base", icon: null },
        { label: "Documentation Fees", sub: "", amount: d.doc_fees, highlight: "base", icon: null },
    ];

    const chartData = [
        { name: "Current Baseline", val: d.total_landed_cost, color: "#94a3b8" },
        { name: "Simulated Scenario", val: activeTotal, color: "#8b5cf6" },
        { name: "Best Global Option", val: bestScenario.total_landed_cost, color: "#10b981" },
    ];

    const handleExport = () => {
        if (!apiData) return;

        const reportData = {
            metadata: {
                product_name: description || name || "Product",
                hs_code: hsCode,
                export_date: new Date().toISOString(),
                origin: origin,
                destination: dest,
                weight_kg: d.weight_kg,
            },
            current_scenario: {
                ...d,
                simulated_tariff_rate: simulatedTariffRate,
                effective_total_cost: activeTotal,
            },
            cost_breakdown: COST_ITEMS.map(item => ({
                component: item.label,
                description: item.sub,
                amount: item.amount,
                note: item.note || ""
            })),
            alternative_scenarios: scenarios
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `landed_cost_report_${hsCode || "export"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <PageShell title="Landed Cost">
            <TradeSummaryHeader />

            <div className="animate-fade-in-up" style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calculator size={22} color="#10b981" />
                </div>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>Total Landed Cost Calculator</h1>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Business value engine with comprehensive cost analysis</p>
                </div>
                {loading && (
                    <div style={{ marginLeft: "auto", display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: 13, fontWeight: 600 }}>
                        <RefreshCw size={14} className="animate-spin-slow" /> Analyzing scenarios...
                    </div>
                )}
            </div>

            {error && (
                <div className="animate-fade-in-up" style={{ padding: "12px 16px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", fontSize: 13, fontWeight: 500, marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <RefreshCw size={14} /> {error}. Displaying fallback calculations.
                </div>
            )}

            {/* ── 3 KPI Cards ────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 24 }}>
                {[
                    { label: "Total Landed Cost", value: fmt(activeTotal), sub: `For ${d.weight_kg} units`, border: "#2563eb" },
                    { label: "Cost Per Unit", value: fmt(costPerUnit), sub: "Including all charges", border: "#10b981", valueColor: "#10b981" },
                    { label: "Optimization Potential", value: fmt(savings), sub: `${savingsPct.toFixed(1)}% reduction available`, border: "#8b5cf6", valueColor: "#8b5cf6" },
                ].map((k, i) => (
                    <div key={i} className="glass-card card-shadow animate-fade-in-up" style={{ padding: "20px 22px", borderLeft: `6px solid ${k.border}`, borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', borderRadius: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>{k.label}</div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: k.valueColor || "#2563eb", lineHeight: 1 }}>{loading ? "..." : k.value}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, fontWeight: 400 }}>{loading ? "..." : k.sub}</div>
                    </div>
                ))}
            </div>

            {/* ── Detailed Cost Breakdown ─────────── */}
            <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: "20px 24px", marginTop: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <FileText size={18} color="#2563eb" />
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Detailed Cost Breakdown</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {COST_ITEMS.map((item, i) => {
                        const hs = highlightStyle[item.highlight as keyof typeof highlightStyle];
                        return (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "16px 20px", borderRadius: 8,
                                background: hs.bg,
                                border: `1px solid ${hs.border}`,
                                borderLeft: item.highlight !== 'base' ? `4px solid ${hs.left}` : `1px solid ${hs.border}`,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {item.icon === "ship" && <Ship size={18} color={hs.textColor} />}
                                    {item.icon === "plane" && <Plane size={18} color={hs.textColor} />}
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: hs.textColor }}>{item.label}</div>
                                        {item.sub && <div style={{ fontSize: 13, color: item.highlight !== 'base' ? hs.textColor : "var(--text-muted)", marginTop: 2, fontWeight: 400, opacity: item.highlight !== 'base' ? 0.8 : 1 }}>{item.sub}</div>}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: item.highlight !== 'base' ? hs.textColor : "var(--text-primary)" }}>{loading ? "..." : fmt(item.amount)}</div>
                                    {item.note && <div style={{ fontSize: 11, color: hs.textColor, fontWeight: 500, opacity: 0.75 }}>{item.note}</div>}
                                </div>
                            </div>
                        );
                    })}
                    {/* Total row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", marginTop: 6 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 }}>TOTAL LANDED COST</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>All-inclusive final cost</div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{loading ? "..." : fmt(activeTotal)}</div>
                    </div>
                </div>
            </div>

            {/* ── Cost Optimization Analysis Chart ─────────── */}
            <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: "20px 24px", marginTop: 24, borderRadius: 12 }}>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Cost Optimization Analysis</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Comparison between current and optimized scenarios</div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#64748b" }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Amount"]} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
                        <Bar dataKey="val" radius={[4, 4, 0, 0]} maxBarSize={200}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* ── What-If Simulation ─────────── */}
            <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: "24px", marginTop: 24, borderRadius: 12 }}>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                    <Calculator size={18} color="#2563eb" />
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Tariff Rate What-If Simulation</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Dynamically adjust tariff rates to see cascading impacts on customs duty, VAT, GST, and Total Landed Cost.</div>
                    </div>
                </div>

                <div style={{ padding: "20px", background: "var(--bg-base)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Simulate Tariff Rate (%)</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: "#8b5cf6" }}>{activeTariffRate.toFixed(1)}%</span>
                            {simulatedTariffRate !== null && simulatedTariffRate !== baseTariffRate && (
                                <button
                                    onClick={() => setSimulatedTariffRate(null)}
                                    style={{ padding: "4px 8px", fontSize: 11, background: "#f1f5f9", border: "none", borderRadius: 4, cursor: "pointer", color: "#64748b", fontWeight: 600 }}
                                >
                                    Reset to Base ({baseTariffRate.toFixed(1)}%)
                                </button>
                            )}
                        </div>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.1"
                        value={activeTariffRate}
                        onChange={(e) => setSimulatedTariffRate(parseFloat(e.target.value))}
                        style={{ width: "100%", cursor: "pointer", accentColor: "#8b5cf6" }}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                    </div>

                    {simulatedTariffRate !== null && simulatedTariffRate !== baseTariffRate && (
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Simulated Total Cost</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{fmt(activeTotal)}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Difference vs Baseline</div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: activeTotal > d.total_landed_cost ? "#ef4444" : "#10b981" }}>
                                    {activeTotal > d.total_landed_cost ? '+' : ''}{fmt(activeTotal - d.total_landed_cost)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Action Buttons ─────────── */}
            <div className="animate-fade-in-up" style={{ display: "flex", gap: 16, marginTop: 24 }}>
                <button
                    onClick={handleExport}
                    disabled={!apiData}
                    className="btn-primary"
                    style={{ flex: 1, padding: "16px", fontSize: 15, fontWeight: 600, borderRadius: 8, background: "#3b82f6", color: "white", border: "none", cursor: !apiData ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, opacity: !apiData ? 0.6 : 1 }}
                >
                    <FileText size={18} /> Export Cost Analysis Report (JSON)
                </button>
            </div>

            <div style={{ height: 40 }} />
        </PageShell>
    );
}
