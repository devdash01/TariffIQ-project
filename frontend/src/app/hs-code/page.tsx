"use client";
import PageShell from "@/components/PageShell";
import TradeSummaryHeader from "@/components/TradeSummaryHeader";
import { useState, useEffect } from "react";
import { Sparkles, CheckCircle, Brain, ShieldAlert, AlertTriangle, ChevronRight } from "lucide-react";
import { useTradeContext } from "@/context/TradeContext";

export default function HSCode() {
    const { name, category, description, material, intendedUse, hsCode, dest, setTradeData } = useTradeContext();
    const [loading, setLoading] = useState(false);

    // API State
    const [classificationResult, setClassificationResult] = useState<any>(null);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [override, setOverride] = useState("");

    useEffect(() => {
        if (!name && !description) return; // Wait for context
        classify();
    }, [name, description, dest]);

    async function classify() {
        if (loading) return;
        setLoading(true); setClassificationResult(null); setCandidates([]);

        try {
            const productString = `${name || ""} ${description || ""}`.trim();
            
            // Clear current HS code in context so it doesn't look "fixed" while we wait
            setTradeData({ hsCode: null });

            const res = await fetch("http://localhost:8000/api/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    product_description: productString,
                    destination: dest || "Select destination"
                })
            });
            const data = await res.json();

            if (res.ok && data.results) {
                // Use the backend's designated primary choice if available, otherwise fallback to first result
                const bestCandidate = data.results.find((c: any) => String(c.hs_code) === String(data.primary_hs)) || data.results[0];
                
                // Enrich data to match UI needs
                const enhancedResult = {
                    primary_hs: data.primary_hs || bestCandidate.hs_code,
                    confidence: data.confidence || bestCandidate.score,
                    reasoning: bestCandidate.reasoning,
                    extracted_features: {
                        CATEGORY: category || "Unknown",
                        MATERIAL: material || "Not specified",
                        "PRODUCT": name || "Apparel",
                        "END USE": intendedUse || "General",
                    },
                    duty_rate: bestCandidate.duty_rate,
                    risk: bestCandidate.risk
                };

                setClassificationResult(enhancedResult);
                setCandidates(data.results);

                // Auto-set the best HS code to global context
                if (enhancedResult.primary_hs) {
                    setTradeData({ hsCode: String(enhancedResult.primary_hs) });
                }
            } else {
                console.error("Classification failed:", data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function selectCode(code: string) {
        setTradeData({ hsCode: String(code) });
        setOverride(""); // Clear override if picking from list
    }

    function handleOverride() {
        if (override.trim()) {
            setTradeData({ hsCode: override.trim() });
        }
    }

    return (
        <PageShell title="HS Code AI">
            <TradeSummaryHeader />

            {/* AI Active Header */}
            <div className="glass-card card-shadow animate-fade-in-up" style={{
                padding: "16px 24px",
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0"
            }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Brain size={20} color="#9333ea" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>AI Product Understanding &amp; HS Classification</h1>
                            <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0 0" }}>NLP-powered harmonized system code prediction with explainability</p>
                        </div>
                    </div>
                    <div style={{ padding: "8px 16px", borderRadius: 99, background: "#f3e8ff", color: "#9333ea", fontWeight: 700, fontSize: 13 }}>
                        AI Confidence: {classificationResult ? Math.round((classificationResult.confidence || 0) * 100) : "..."}%
                    </div>
                </div>

                {classificationResult && classificationResult.extracted_features && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {Object.entries(classificationResult.extracted_features).map(([key, val]) => (
                            <div key={key} style={{ padding: "6px 12px", borderRadius: 6, background: "transparent", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{key}:</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{String(val)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Empty State */}
            {!name && !description && !loading && !classificationResult && (
                <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: 36, textAlign: "center", marginTop: 20 }}>
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Please enter product details in the Trade Input page first.</p>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: 36, textAlign: "center", marginTop: 24 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sparkles size={24} color="#7c3aed" className="animate-pulse" />
                        </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>Classifying "{name || 'Product'}"…</div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Scanning FAISS HS indices · Running SentenceTransformer matching · Validating chapter notes</p>
                </div>
            )}

            {classificationResult && !loading && (<>
                {/* Matches & Alternatives List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 24 }}>
                    {candidates && candidates.length > 0 && candidates.map((c, idx) => {
                        const isRecommended = String(c.hs_code) === String(classificationResult.primary_hs);

                        return (
                            <div key={c.hs_code} className={`glass-card card-shadow animate-fade-in-up delay-${(idx + 1) * 100}`} style={{ padding: 24, border: isRecommended ? "2px solid #22c55e" : "1px solid #e2e8f0", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                            <span style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", fontFamily: "monospace" }}>{c.hs_code}</span>
                                            {isRecommended && (
                                                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#22c55e", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
                                                    <CheckCircle size={14} /> Recommended
                                                </span>
                                            )}
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: isRecommended ? "#0f172a" : (c.risk === "High" ? "#fee2e2" : "#f1f5f9"), color: isRecommended ? "#fff" : (c.risk === "High" ? "#991b1b" : "#64748b") }}>
                                                {c.risk} Risk
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 14, color: "#475569" }}>{c.description}</div>
                                    </div>
                                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Duty Rate</span>
                                        <span style={{ fontSize: 22, fontWeight: 800, color: "#3b82f6" }}>{c.duty_rate}</span>
                                    </div>
                                </div>

                                {/* Confidence Bar */}
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>AI Confidence Score</span>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>{Math.round((c.score || 0) * 100)}%</span>
                                    </div>
                                    <div style={{ height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${Math.round((c.score || 0) * 100)}%`, background: "#0f172a", borderRadius: 99 }} />
                                    </div>
                                </div>

                                {/* Reasoning Box */}
                                <div style={{ padding: "16px", borderRadius: 12, background: "#fdfaff", border: "1px solid #f3e8ff" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <Brain size={16} color="#9333ea" />
                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#6b21a8" }}>AI Reasoning &amp; Explainability</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: "#4c1d95", lineHeight: 1.6 }}>{isRecommended ? (classificationResult.reasoning || c.reasoning) : c.reasoning}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Manual Override */}
                <div className="glass-card card-shadow animate-fade-in-up delay-300" style={{ padding: 24, marginTop: 24, border: "1.5px solid #fde68a", background: "#fffbeb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <AlertTriangle size={18} color="#d97706" />
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#b45309" }}>Manual HS Code Override</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#d97706", marginBottom: 16 }}>You can manually override the AI classification, but be aware of potential compliance risks and duty impacts.</p>
                    <div style={{ display: "flex", gap: 12 }}>
                        <input
                            value={override}
                            onChange={(e) => setOverride(e.target.value)}
                            placeholder="Enter HS Code (e.g., 6109.10.00)"
                            style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1.5px solid #fcd34d", outline: "none", fontSize: 14, color: "#92400e", background: "#fff" }}
                        />
                        <button onClick={handleOverride} style={{ padding: "12px 24px", borderRadius: 8, background: "#ea580c", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                            Override &amp; Analyze Impact
                        </button>
                    </div>
                </div>
            </>)}
        </PageShell>
    );
}
