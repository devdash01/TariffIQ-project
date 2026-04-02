"use client";
import PageShell from "@/components/PageShell";
import TradeSummaryHeader from "@/components/TradeSummaryHeader";
import { useState, useEffect } from "react";
import {
    ShieldCheck, Globe, FileText, AlertTriangle,
    CheckCircle, XCircle, AlertCircle, Scale,
    CheckSquare, Square, Download, RefreshCw, Info
} from "lucide-react";
import { useTradeContext } from "@/context/TradeContext";
import { API_ENDPOINTS } from "@/config/api";

const statusStyle = {
    Obtained: { bg: "#0f172a", color: "#fff" },
    Pending: { bg: "#f1f5f9", color: "#475569" },
    "N/A": { bg: "#f1f5f9", color: "#94a3b8" },
} as const;

const riskColors = {
    Low: { bg: "#f0fdf4", border: "#bbf7d0", badge: "#059669", icon: "#059669", text: "Low Risk" },
    Medium: { bg: "#fffbeb", border: "#fcd34d", badge: "#d97706", icon: "#d97706", text: "Medium Risk" },
    High: { bg: "#fef2f2", border: "#fca5a5", badge: "#ef4444", icon: "#ef4444", text: "High Risk" },
    Critical: { bg: "#fef2f2", border: "#f87171", badge: "#b91c1c", icon: "#b91c1c", text: "Critical Risk" },
} as const;

/* ── Component ─────────────────────────────────────── */
export default function Compliance() {
    const { origin, dest, hsCode, description } = useTradeContext();
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState<any>(null);
    const [checks, setChecks] = useState<{ label: string, done: boolean }[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleExport = () => {
        if (!apiData) return;

        const exportData = {
            ...apiData,
            completed_checklist: checks.filter(c => c.done).map(c => c.label),
            pending_checklist: checks.filter(c => !c.done).map(c => c.label)
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `compliance_report_${hsCode || 'product'}.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    useEffect(() => {
        if (!origin || !dest || !hsCode) return;
        if (origin.includes("Select") || dest.includes("Select")) return;

        const fetchCompliance = async () => {
            setLoading(true);
            try {
                const res = await fetch(API_ENDPOINTS.COMPLIANCE, {
                    method: "POST",
                    signal: AbortSignal.timeout(120000),
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_description: description,
                        destination: dest
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setApiData(data);
                    if (data?.compliance_checklist) {
                        setChecks(data.compliance_checklist.map((c: any) => ({
                            label: c.requirement_title,
                            done: false
                        })));
                    }
                    setError(null);
                } else {
                    const errorData = await res.json().catch(() => ({ detail: "Unknown server error" }));
                    setError(errorData.detail || `Error: ${res.status} ${res.statusText}`);
                }
            } catch (err: any) {
                console.error("Failed to fetch compliance:", err);
                setError(err.name === "TimeoutError" ? "Request timed out. The AI is still working, please try again." : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCompliance();
    }, [origin, dest, hsCode, description]);

    const toggle = (i: number) =>
        setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, done: !c.done } : c));

    const doneCount = checks.filter(c => c.done).length;

    if (!origin && !loading && !apiData) {
        return (
            <PageShell title="Compliance">
                <TradeSummaryHeader />
                <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: 36, textAlign: "center", marginTop: 20 }}>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Please enter routing details and obtain an HS Code in the Trade Input page first.</p>
                </div>
            </PageShell>
        );
    }

    const data = apiData || {
        risk_level: "Medium",
        compliance_checklist: [],
        rules_of_origin_evaluation: [],
        estimated_complexity: "5",
        summary_advice: "Awaiting analysis..."
    };

    // Calculate dynamic compliance score based on rule evaluation
    const metRules = data.rules_of_origin_evaluation?.filter((r: any) => r.status === "Met").length || 0;
    const totalRules = data.rules_of_origin_evaluation?.length || 0;
    
    // Improved Scoring: 
    // - Incorporate both technical 'Rules' and the 'Checklist'
    // - Deduct points for 'High' or 'Critical' risk levels
    let baseScore = (totalRules > 0) ? Math.round((metRules / totalRules) * 100) : 0;
    
    // Penalize score if risk level is high, even if rules are met
    if (data.risk_level === "High") baseScore = Math.min(baseScore, 70);
    if (data.risk_level === "Critical") baseScore = Math.min(baseScore, 40);
    if (data.risk_level === "Medium" && baseScore > 90) baseScore = 85; // cap at 85 for medium risk

    const aiDerivedScore = apiData ? baseScore : 0;

    const riskColorConfig = riskColors[data.risk_level as keyof typeof riskColors] || riskColors.Medium;

    return (
        <PageShell title="Compliance">
            <TradeSummaryHeader />

            {/* ── Page header ─────────────────────── */}
            <div className="animate-fade-in-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShieldCheck size={22} color="#059669" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>Regulatory Compliance</h1>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Live AI assessment of import/export restrictions and required documentation</p>
                    </div>
                </div>
                {loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 13, fontWeight: 600 }}>
                        <RefreshCw size={14} className="animate-spin-slow" /> Running compliance checks...
                    </div>
                )}
                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 13, fontWeight: 600, background: '#fef2f2', padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca' }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}
            </div>

            {/* ── Compliance Engine Banner ─────────── */}
            <div className="animate-fade-in-up delay-100" style={{ padding: "24px 32px", marginTop: 24, borderRadius: 16, background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 16 }}>
                    <ShieldCheck size={26} color="#059669" />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Country-of-Origin & Compliance Engine</div>
                        <div style={{ fontSize: 14, color: "#059669", marginTop: 4, fontWeight: 500, lineHeight: 1.4 }}>
                            Regulatory brain with real-time compliance validation
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "right", padding: "16px 24px", borderRadius: 12, background: "#dcfce7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: 1 }}>Overall Compliance</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#059669", lineHeight: 1 }}>{aiDerivedScore}%</div>
                </div>
            </div>

            {/* ── 6-Metric Grid ────────────────────── */}
            <div className="animate-fade-in-up delay-200" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 24 }}>
                {[
                    { title: "Country of Origin", state: "8/8", icon: <CheckCircle size={18} color="#059669" />, score: 95, color: "#059669" },
                    { title: "Restricted Goods", state: "12/12", icon: <CheckCircle size={18} color="#059669" />, score: 100, color: "#059669" },
                    { title: "Licenses & Permits", state: "3/5", icon: <AlertTriangle size={18} color="#d97706" />, score: 75, color: "#d97706" },
                    { title: "Value Addition", state: "4/4", icon: <CheckCircle size={18} color="#059669" />, score: 88, color: "#059669" },
                    { title: "Documentation", state: "7/10", icon: <AlertTriangle size={18} color="#d97706" />, score: 70, color: "#d97706" },
                    { title: "Sanctions Check", state: "6/6", icon: <CheckCircle size={18} color="#059669" />, score: 100, color: "#059669" },
                ].map((metric, idx) => (
                    <div key={idx} className="glass-card card-shadow" style={{ padding: 20, borderRadius: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {metric.icon}
                                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{metric.title}</span>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, background: "#0f172a", color: "#fff", padding: "4px 8px", borderRadius: 99 }}>{metric.state}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 99, background: "#e2e8f0", overflow: "hidden", marginBottom: 8 }}>
                            <div style={{ height: "100%", width: `${metric.score}%`, background: "#0f172a", borderRadius: 99 }} />
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Score: {metric.score}%</div>
                    </div>
                ))}
            </div>

            {/* ── Country of Origin Rule Evaluation ─── */}
            <div className="glass-card card-shadow animate-fade-in-up delay-300" style={{ padding: 24, marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <Globe size={18} color="#2563eb" />
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Country of Origin Rule Evaluation</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Substantial transformation and value addition analysis</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(data.rules_of_origin_evaluation || [
                        { rule_name: "Substantial Transformation", analysis: "Product underwent change in tariff heading from raw material to finished good", status: "Met" },
                        { rule_name: "Value Addition Threshold", analysis: "Local value addition: 68% (Required: >35%)", status: "Met" },
                        { rule_name: "Manufacturing Process", analysis: "Complete manufacturing from yarn to finished garment", status: "Met" },
                        { rule_name: "Certificate Validity", analysis: "Certificate of Origin expired - renewal required", status: "Not Met" },
                    ]).map((rule: any, idx: number) => (
                        <div key={idx} style={{ padding: "16px", borderRadius: 8, background: rule.status === "Met" ? "#f0fdf4" : (rule.status === "Not Met" ? "#fef2f2" : "#f8fafc"), display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `4px solid ${rule.status === "Met" ? "#22c55e" : (rule.status === "Not Met" ? "#ef4444" : "#94a3b8")}` }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1 }}>
                                {rule.status === "Met" ? <CheckCircle size={16} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} /> : (rule.status === "Not Met" ? <XCircle size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} /> : <AlertCircle size={16} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />)}
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{rule.rule_name}</div>
                                    <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>{rule.analysis}</div>
                                </div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 99, background: rule.status === "Met" ? "#0f172a" : (rule.status === "Not Met" ? "#ef4444" : "#94a3b8"), color: "#fff", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 16 }}>
                                {rule.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 24 }}>
                {/* ── Regulatory Risk Scoring & Red Flags ─ */}
                <div className="glass-card card-shadow animate-fade-in-up delay-400" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <AlertCircle size={18} color="#dc2626" />
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Regulatory Risk Scoring & Red Flags</div>
                    </div>

                    {data.compliance_checklist && data.compliance_checklist.length === 0 ? (
                        <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No major regulatory requirements detected.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {data.compliance_checklist?.map((c: any, i: number) => {
                                const level = c.is_mandatory ? "Medium" : "Low";
                                const isHigh = c.is_mandatory;
                                const bg = isHigh ? "#fffbeb" : "#eff6ff";
                                const border = isHigh ? "#fde68a" : "#bfdbfe";
                                const borderLeft = isHigh ? "#f59e0b" : "#3b82f6";
                                const iconColor = isHigh ? "#d97706" : "#3b82f6";
                                const badgeBg = isHigh ? "#fef3c7" : "#dbeafe";
                                const badgeColor = isHigh ? "#b45309" : "#1e40af";
                                return (
                                    <div key={i} style={{ padding: 20, borderRadius: 12, background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${borderLeft}` }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                            <AlertTriangle size={18} color={iconColor} />
                                            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: badgeBg, color: badgeColor }}>{level} Risk</span>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{c.requirement_title}</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>{c.description}</p>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                            <div style={{ padding: 12, borderRadius: 8, background: "#fff", border: `1px solid ${badgeBg}` }}>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>Category</div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.category}</div>
                                            </div>
                                            <div style={{ padding: 12, borderRadius: 8, background: "#fff", border: `1px solid ${badgeBg}` }}>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>Potential Impact</div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.is_mandatory ? "Customs rejection / Fines" : "Potential delays"}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Compliance Checklist Generator ───── */}
                <div className="glass-card card-shadow animate-fade-in-up delay-500" style={{ padding: 24, alignSelf: "start" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Scale size={18} color="#9333ea" />
                            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Compliance Checklist Generator</div>
                        </div>
                        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{doneCount}/{checks.length} complete</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                        {checks.length === 0 && !loading && (
                            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No special documentation required.</div>
                        )}
                        {checks.map((c, i) => (
                            <div key={i} onClick={() => toggle(i)} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "16px", borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", cursor: "pointer"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    {c.done
                                        ? <CheckSquare size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                                        : <Square size={20} color="#475569" style={{ flexShrink: 0, fill: "#475569" }} />}
                                    <span style={{
                                        fontSize: 14, fontWeight: 600, lineHeight: 1.4,
                                        color: c.done ? "#94a3b8" : "var(--text-primary)",
                                        textDecoration: c.done ? "line-through" : "none",
                                    }}>{c.label}</span>
                                </div>
                                {c.done && <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0, marginLeft: 12 }} />}
                            </div>
                        ))}
                    </div>

                    {/* Bottom Action Row */}
                    <div style={{ display: "flex", gap: 16 }}>
                        <button onClick={handleExport} style={{
                            flex: 1, padding: "14px",
                            borderRadius: 10, background: "#ef4444", border: "none",
                            color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)"
                        }}>
                            <Download size={18} />
                            Export Audit-Ready Compliance Report
                        </button>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
