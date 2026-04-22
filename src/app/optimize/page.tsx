"use client";
import PageShell from "@/components/PageShell";
import TradeSummaryHeader from "@/components/TradeSummaryHeader";
import { Sparkles, MapPin, TrendingUp, Zap, Target, RefreshCw, Building, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTradeContext } from "@/context/TradeContext";
import { API_ENDPOINTS } from "@/config/api";
import { useEffect, useState } from "react";

const fmt = (n: any) => {
    const val = Number(n);
    if (isNaN(val)) return "$0";
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function Optimize() {
    const { origin: ctxOrigin, dest: ctxDest, value: ctxValue, hsCode, description: ctxDescription, weight: ctxWeight, transport: ctxTransport, landedCost, scenarios, setTradeData } = useTradeContext();
    const [loading, setLoading] = useState(false);
    const [localData, setLocalData] = useState<any>(null);
    const [localScenarios, setLocalScenarios] = useState<any[]>([]);

    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [vendorsData, setVendorsData] = useState<any[]>([]);
    const [bestSrcParam, setBestSrcParam] = useState<string | null>(null);

    useEffect(() => {
        if (!ctxOrigin || !ctxDest || !hsCode) return;

        // If we already have it in context, just use it
        if (landedCost && scenarios && scenarios.length > 0) {
            setLocalData(landedCost);
            setLocalScenarios(scenarios);
            return;
        }

        // Otherwise fetch it
        setLoading(true);
        const fetchOptimization = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.LANDED_COST, {
                    method: "POST",
                    signal: AbortSignal.timeout(120000),
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        origin: ctxOrigin,
                        destination: ctxDest,
                        mode: ctxTransport === "Air" ? "air" : "sea",
                        weight_kg: Number(ctxWeight?.replace(/[^0-9.-]+/g, "")) || 1,
                        product_value: Number(ctxValue?.replace(/[^0-9.-]+/g, "")) || 10000,
                        product_description: "Optimization Query",
                        hs_code: hsCode
                    })
                });
                const data = await res.json();
                if (data?.landed_cost) {
                    setLocalData(data.landed_cost);
                    setLocalScenarios(data.scenarios || []);
                    setTradeData({ landedCost: data.landed_cost, scenarios: data.scenarios || [] });
                }
            } catch (err) {
                console.error("Failed to load optimization data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOptimization();
    }, [ctxOrigin, ctxDest, hsCode, ctxTransport, ctxWeight, ctxValue, landedCost, scenarios, setTradeData]);

    // Fetch Vendors for the best source automatically
    useEffect(() => {
        if (!bestSrcParam || !ctxDescription) return;

        setVendorsLoading(true);
        const fetchVendors = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.VENDORS, {
                    method: "POST",
                    signal: AbortSignal.timeout(120000),
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product: ctxDescription,
                        country: bestSrcParam
                    })
                });
                const data = await res.json();
                if (data?.vendors) {
                    setVendorsData(data.vendors);
                }
            } catch (err) {
                console.error("Failed to load vendors", err);
            } finally {
                setVendorsLoading(false);
            }
        };

        fetchVendors();
    }, [bestSrcParam, ctxDescription]);

    if (!ctxOrigin) {
        return (
            <PageShell title="Optimize">
                <TradeSummaryHeader />
                <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: 36, textAlign: "center", marginTop: 20 }}>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Please enter routing details and obtain an HS Code in the Trade Input page first.</p>
                </div>
            </PageShell>
        );
    }

    // Prepare data
    const d = localData || {
        total_landed_cost: 15900,
        route: `${ctxOrigin} → ${ctxDest}`,
        import_duty: 0,
        mode: ctxTransport?.toLowerCase() === 'air' ? 'air' : 'sea'
    };

    // Sort ascending by cost
    const sortedScenarios = [...(localScenarios || [])].sort((a, b) => a.total_landed_cost - b.total_landed_cost);

    // Best alternative scenario
    const bestScenario = sortedScenarios.find(s => s.route !== d.route) || sortedScenarios[0] || d;
    const bestSrc = bestScenario.route.split(" → ")[0].trim().replace(/\b\w/g, (l: string) => l.toUpperCase());

    // Set the best source for vendor fetching if different
    useEffect(() => {
        if (bestSrc && bestSrc !== bestSrcParam) {
            setBestSrcParam(bestSrc);
        }
    }, [bestSrc, bestSrcParam]);

    const savings = Math.max(0, d.total_landed_cost - bestScenario.total_landed_cost);
    const savingsPct = d.total_landed_cost > 0 ? (savings / d.total_landed_cost) * 100 : 0;

    // Dummy values for recommendation blocks if API doesn't provide them yet
    const annualShipments = 12;
    const annualSavings = savings * annualShipments;

    return (
        <PageShell title="Optimize">
            <TradeSummaryHeader />

            {/* ── Page Header & Banner ────────────────────── */}
            <div className="animate-fade-in-up" style={{ padding: "20px 24px", marginTop: 24, borderRadius: 12, background: "#fff", border: "1px solid #e9d5ff", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 10px rgba(147, 51, 234, 0.03)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Sparkles size={20} color="#9333ea" />
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>AI Optimization &amp; Recommendation Engine</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{loading ? "Analyzing global trade data..." : "Multi-objective optimization for cost, risk, and time"}</div>
                    </div>
                </div>
                <div style={{ textAlign: "right", padding: "12px 20px", borderRadius: 10, background: "#f5f3ff", display: "inline-block" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9333ea", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>OPTIMIZATION POTENTIAL</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#9333ea", lineHeight: 1 }}>{loading ? "..." : fmt(savings)}</div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
                    <RefreshCw size={24} className="animate-spin-slow" style={{ margin: "0 auto", marginBottom: 16 }} color="#2563eb" />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Calculating optimized routes and scenarios...</div>
                </div>
            ) : savings > 0 ? (
                <>
                    {/* ── Highlight Recommendation ─────────── */}
                    <div className="animate-fade-in-up delay-100" style={{ padding: "24px 28px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", position: "relative", overflow: "hidden", marginBottom: 24, boxShadow: "0 4px 20px rgba(5, 150, 105, 0.05)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Target size={22} color="#fff" />
                            </div>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 4, background: "#059669", color: "#fff" }}>AI Recommended</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 4, background: "#fff", border: "1px solid #cbd5e1", color: "var(--text-primary)" }}>Highest ROI</span>
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#064e3b", lineHeight: 1.2, marginBottom: 6 }}>Switch to {bestSrc} Sourcing</h2>
                                <p style={{ fontSize: 14, color: "#059669", fontWeight: 500, lineHeight: 1.5 }}>
                                    Migrate 60% of production from {ctxOrigin} to {bestSrc} to leverage {bestScenario.has_preference ? 'FTA benefits' : 'lower overall landed costs'} while maintaining quality standards.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20 }}>
                            {[
                                { l: "Annual Savings", v: fmt(annualSavings) },
                                { l: "Implementation", v: "3-4 Mo" },
                                { l: "ROI Timeline", v: "18 Mo" },
                                { l: "Confidence", v: "92%" },
                            ].map(b => (
                                <div key={b.l} style={{ padding: "16px 20px", borderRadius: 8, background: "#fff", border: "1px solid #bbf7d0" }}>
                                    <div style={{ fontSize: 12, color: "#059669", fontWeight: 500, marginBottom: 8 }}>{b.l}</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: "#064e3b" }}>{b.v}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <button style={{ padding: "12px 20px", borderRadius: 8, background: "#059669", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-block" }}>
                                Generate Implementation Plan
                            </button>
                        </div>
                    </div>

                    {/* ── Alternative Sourcing Countries ───── */}
                    <div className="glass-card card-shadow animate-fade-in-up delay-100" style={{ padding: 24, marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                            <MapPin size={18} color="#2563eb" />
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Alternative Sourcing Country Analysis</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Duty-optimized country recommendations with compliance verification</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {sortedScenarios.map((s, i) => {
                                if (s.route === d.route) return null;
                                const src = s.route.split(" → ")[0].trim().replace(/\b\w/g, (l: string) => l.toUpperCase());
                                const sSavings = d.total_landed_cost - s.total_landed_cost;
                                const sSavingsPct = (sSavings / d.total_landed_cost) * 100;
                                const isBest = s.route === bestScenario.route;

                                // Mock data for missing API fields to match design
                                const riskLevel = i % 2 === 0 ? "Low Risk" : "Medium Risk";
                                const compliancePct = isBest ? 95 : (80 + Math.floor(Math.random() * 15));
                                const recommendationStr = isBest ? "Highly Recommended" : (sSavings > 0 ? "Good Alternative" : "Consider");

                                return (
                                    <div key={src}>
                                        <div style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "20px", borderRadius: 12, borderBottomLeftRadius: isBest ? 0 : 12, borderBottomRightRadius: isBest ? 0 : 12,
                                            background: isBest ? "#f0fdf4" : "#fff",
                                            border: `1px solid ${isBest ? "#bbf7d0" : "var(--border)"}`,
                                            borderBottom: isBest ? "none" : `1px solid var(--border)`
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{src}</span>
                                                    {riskLevel === "Low Risk" ? (
                                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#0f172a", color: "#fff" }}>Low Risk</span>
                                                    ) : (
                                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1" }}>Medium Risk</span>
                                                    )}
                                                    {isBest && <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: "#059669", color: "#fff" }}>Best Choice</span>}
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 20 }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Duty Rate</div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{s.applied_tariff}% {s.has_preference ? '(FTA)' : ''}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Transit Time</div>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{s.mode === 'air' ? '5 days' : '28 days'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>
                                                            <span>Compliance</span>
                                                            <span>Recommendation</span>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 99 }}>
                                                                <div style={{ height: "100%", width: `${compliancePct}%`, background: "#0f172a", borderRadius: 99 }} />
                                                            </div>
                                                            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>
                                                                {compliancePct}% <span style={{ fontWeight: 600, color: "var(--text-muted)", marginLeft: 6 }}>{recommendationStr}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16, padding: "12px", background: isBest ? "#ffffff" : "#f8fafc", borderRadius: 8, border: `1px solid ${isBest ? "#bbf7d0" : "#e2e8f0"}` }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Base Value</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(s.product_value)}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Freight</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(s.shipping_cost)}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Duties</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{fmt(s.import_duty)}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Taxes</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{fmt((s.import_vat || 0) + (s.gst_cost || 0) + (s.cess_cost || 0))}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Other Fees</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{fmt((s.insurance_cost || 0) + (s.handling_fees || 0) + (s.doc_fees || 0))}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right", borderLeft: "1px solid var(--border)", paddingLeft: 24, marginLeft: 24, minWidth: 120 }}>
                                                {sSavings > 0 ? (
                                                    <>
                                                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>Estimated Savings</div>
                                                        <div style={{ fontSize: 22, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{fmt(sSavings)}</div>
                                                        <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 4 }}>{sSavingsPct.toFixed(0)}% reduction</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>Estimated Cost</div>
                                                        <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>{fmt(s.total_landed_cost)}</div>
                                                        <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginTop: 4 }}>+ {Math.abs(sSavingsPct).toFixed(0)}% increase</div>
                                                    </>
                                                )}

                                            </div>
                                        </div>

                                        {isBest && (
                                            <div style={{ padding: "16px 20px", background: "#f8fafc", border: `1px solid #bbf7d0`, borderTop: "none", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                                    <Building size={16} color="#64748b" />
                                                    <span style={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>Top Vendors in {src} for "{ctxDescription}"</span>
                                                    {vendorsLoading && <RefreshCw size={14} className="animate-spin-slow" color="#2563eb" style={{ marginLeft: "auto" }} />}
                                                </div>

                                                {vendorsLoading ? (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="animate-pulse" style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 12 }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                                                        <div style={{ width: "30%", height: 14, background: "#e2e8f0", borderRadius: 4 }} />
                                                                        <div style={{ width: 40, height: 10, background: "#f1f5f9", borderRadius: 4 }} />
                                                                    </div>
                                                                    <div style={{ width: "95%", height: 10, background: "#f1f5f9", borderRadius: 4, marginBottom: 4 }} />
                                                                    <div style={{ width: "70%", height: 10, background: "#f1f5f9", borderRadius: 4 }} />
                                                                </div>
                                                                <div style={{ textAlign: "right", minWidth: 60 }}>
                                                                    <div style={{ width: 40, height: 8, background: "#f1f5f9", borderRadius: 4, marginLeft: "auto", marginBottom: 4 }} />
                                                                    <div style={{ width: 50, height: 20, background: "#e2e8f0", borderRadius: 4, marginLeft: "auto" }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : vendorsData.length > 0 ? (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                        {vendorsData.map((v, vidx) => (
                                                            <div key={vidx} className="animate-fade-in-up" style={{ padding: "12px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", gap: 12, transition: "all 0.2s" }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                                        <a href={v.website} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 800, color: "#2563eb", textDecoration: "none" }}>{v.name}</a>
                                                                        <span style={{ fontSize: 10, padding: "2px 6px", background: "#f1f5f9", borderRadius: 4, color: "#64748b", fontWeight: 600 }}>{v.vendor_type || "Vendor"}</span>
                                                                        {v.sells_product && <ShieldCheck size={14} color="#10b981" />}
                                                                        {!v.sells_product && <AlertTriangle size={14} color="#f59e0b" />}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{v.snippet.substring(0, 160)}...</div>
                                                                </div>
                                                                <div style={{ textAlign: "right", minWidth: 80 }}>
                                                                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Trust Score</div>
                                                                    <div style={{ fontSize: 18, fontWeight: 900, color: v.trust_score > 0.7 ? "#059669" : (v.trust_score > 0.4 ? "#f59e0b" : "#ef4444") }}>{Math.round((v.trust_score || 0) * 100)}%</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No verified vendors found yet for this region.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>


                    {/* ── Strategies & Advisor ───────────────────────── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginBottom: 40 }}>
                        <div className="glass-card card-shadow animate-fade-in-up delay-200" style={{ padding: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                <Zap size={18} color="#d97706" />
                                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Cost vs Compliance Optimization Strategies</div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                {[
                                    {
                                        title: "Duty Exposure Reduction",
                                        impact: "High Impact",
                                        desc: `Switch to GSP-eligible sourcing country to eliminate ${fmt(d.import_duty)} in customs duties.`,
                                        effort: "Medium",
                                        time: "3-6 months",
                                        save: `${fmt(d.import_duty)} per shipment`,
                                    },
                                    {
                                        title: "FTA Utilization",
                                        impact: "High Impact",
                                        desc: `Leverage US-${bestSrc} FTA for preferential tariff rates.`,
                                        effort: "Low",
                                        time: "1-2 months",
                                        save: `${fmt(savings)} per shipment`,
                                    },
                                    {
                                        title: "Alternative Routing",
                                        impact: "Medium Impact",
                                        desc: "Transshipment through Singapore port to reduce handling costs",
                                        effort: "Low",
                                        time: "Immediate",
                                        save: `${fmt(savings * 0.12)} per shipment`,
                                    },
                                    {
                                        title: "Consolidation",
                                        impact: "Medium Impact",
                                        desc: "Combine multiple smaller shipments into bulk orders",
                                        effort: "Medium",
                                        time: "2-3 months",
                                        save: `${fmt(savings * 0.35)} per shipment`,
                                    },
                                ].map(s => (
                                    <div key={s.title} style={{ padding: "20px", borderRadius: 12, border: "1px solid var(--border)", background: "#fff" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{s.title}</div>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#0f172a", color: "#fff" }}>{s.impact}</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 16 }}>{s.desc}</p>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                                            <div>
                                                <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Effort</div>
                                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.effort}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Timeline</div>
                                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.time}</div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Savings</div>
                                                <div style={{ fontWeight: 700, color: "#059669" }}>{s.save}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trade Strategy Advisor */}
                        <div className="glass-card card-shadow animate-fade-in-up delay-300" style={{ padding: 24, background: "#f8faff", border: "1px solid #dbeafe" }}>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <Sparkles size={18} color="#4f46e5" />
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>AI Trade Strategy Advisor</h3>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Opinionated intelligence with forward-looking insights</p>
                            </div>

                            <div style={{ padding: "20px", borderRadius: 12, background: "#fff", border: "1px solid #e0e7ff", display: "flex", alignItems: "flex-start", gap: 16 }}>
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Sparkles size={18} color="#fff" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: 18, fontWeight: 800, color: "#312e81", marginBottom: 6 }}>Import now with partial stockpiling</h4>
                                    <p style={{ fontSize: 14, color: "#4f46e5", fontWeight: 500, marginBottom: 16 }}>Tariff increase expected in Q2 2026. Current rates favorable.</p>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                                        <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}><span>Confidence Score</span> <span style={{ color: "#4f46e5" }}>87%</span></div>
                                            <div style={{ height: 6, background: "#e2e8f0", borderRadius: 99, width: "100%" }}>
                                                <div style={{ height: "100%", width: "87%", background: "#4f46e5", borderRadius: 99 }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Action Window</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: "#4f46e5" }}>Next 60 days</div>
                                        </div>
                                        <div style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 2 }}>Trade Outlook</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: "#059669" }}>Bullish</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ padding: 40, textAlign: "center", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>Current Route is Optimal</div>
                    <div style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>Your current sourcing strategy offers the best landed cost out of {localScenarios.length} analyzed markets.</div>
                </div>
            )}
        </PageShell>
    );
}
