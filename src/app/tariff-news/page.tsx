"use client";
import React from "react";
import PageShell from "@/components/PageShell";
import { Sparkles, Calendar, Globe, Hash, CheckCircle2, ChevronDown, Filter, Newspaper, CalendarDays, ArrowRight, X, Check, Activity, ShieldAlert, BarChart3, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

/* ── Data ───────────────────────────────────────── */
const NEWS_ITEMS = [
    {
        id: 1,
        tags: [
            { label: "High", type: "high" },
            { label: "Tariff Change", type: "neutral" },
            { label: "Negative", type: "negative" }
        ],
        headline: "US Increases Tariffs on Chinese Textiles by 5%",
        subHeadline: "New tariff policy affects HS codes 6109.xx and 6110.xx effective April 1, 2026",
        aiSummary: "Tariff increase from 16.5% to 21.5% on cotton apparel from China. Alternative sourcing recommended.",
        effectiveDate: "1/4/2026",
        countries: "US, China",
        hsCodes: "6109.10, 6110.20",
        sourceStatus: "Official Verified",
        changedText: "Duty rate increased by 5 percentage points due to anti-dumping measures",
        before: "16.5% duty on cotton t-shirts",
        after: "21.5% duty on cotton t-shirts",
        costImpact: "+$500 per $10k",
        costImpactColor: "#ef4444",
        whyText: "This is a retaliatory measure in response to unfair trade practices. The government aims to protect domestic textile manufacturers.",
        sectors: ["Textiles", "Apparel"],
        source: "US Customs & Border Protection",
        impactType: "negative",
        chartData: [{ name: "Current ($)", value: 16500 }, { name: "Projected ($)", value: 21500 }],
        impactWarning: "Critical: Margin erosion anticipated. Shift 30% sourcing to Vietnam."
    },
    {
        id: 2,
        tags: [
            { label: "Medium", type: "medium" },
            { label: "Trade Agreement", type: "neutral" },
            { label: "Positive", type: "positive" }
        ],
        headline: "Vietnam-US FTA Extended Benefits for Apparel",
        subHeadline: "Expanded duty-free categories under bilateral trade agreement",
        aiSummary: "Vietnam sourcing now more attractive with 0% duties on expanded product categories including premium apparel.",
        effectiveDate: "15/3/2026",
        countries: "Vietnam, US",
        hsCodes: "6109.xx, 6204.xx, 6205.xx",
        sourceStatus: "Official Verified",
        changedText: "Added 47 new HS codes to preferential tariff schedule",
        before: "8% duty on certain apparel",
        after: "0% duty with Cerfiticate of Origin",
        costImpact: "-$800 per $10k",
        costImpactColor: "#10b981",
        whyText: "Part of ongoing efforts to diversify supply chains and strengthen trade partnerships in Southeast Asia.",
        sectors: ["Textiles", "Fashion", "Retail"],
        source: "Office of US Trade Representative",
        impactType: "positive",
        chartData: [{ name: "Current ($)", value: 28000 }, { name: "Projected ($)", value: 25600 }],
        impactWarning: "Opportunity: Shift US apparel volume to Vietnam for $2.4k Q2 savings."
    },
    {
        id: 3,
        tags: [
            { label: "High", type: "high" },
            { label: "Environmental Policy", type: "neutral" },
            { label: "Mixed", type: "mixed" }
        ],
        headline: "EU Carbon Border Adjustment Mechanism (CBAM) Phase 2",
        subHeadline: "New carbon tariffs on imported goods with high emissions",
        aiSummary: "Products from carbon-intensive manufacturing will face additional levies. Sustainability compliance required.",
        effectiveDate: "1/7/2026",
        countries: "EU, All",
        hsCodes: "Various",
        sourceStatus: "Official Verified",
        changedText: "Carbon tax ranging from €20-€75 per ton of embedded emissions",
        before: "No carbon-based tariffs",
        after: "Up to 15% additional levy",
        costImpact: "Varies by emission",
        costImpactColor: "#f59e0b",
        whyText: "Strategic environmental policy to incentivize low-carbon production and level the playing field.",
        sectors: ["Manufacturing", "Heavy Industry", "Textiles"],
        source: "European Commission",
        impactType: "negative",
        chartData: [{ name: "Current ($)", value: 45000 }, { name: "Projected ($)", value: 52000 }],
        impactWarning: "Warning: High-emission suppliers will trigger up to 15% additional cost."
    },
    {
        id: 4,
        tags: [
            { label: "Medium", type: "medium" },
            { label: "Tariff Reduction", type: "neutral" },
            { label: "Positive", type: "positive" }
        ],
        headline: "India Reduces Import Duties on Electronics Components",
        subHeadline: "Phased tariff reduction to boost domestic manufacturing",
        aiSummary: "Semiconductor and electronics importers benefit from 5-8% duty reduction over next 12 months.",
        effectiveDate: "20/2/2026",
        countries: "India",
        hsCodes: "8542.xx, 8541.xx",
        sourceStatus: "Official Verified",
        changedText: "Reduced duties from 15% to 7% on semiconductor imports",
        before: "15% import duty",
        after: "7% import duty",
        costImpact: "-$800 per $10k",
        costImpactColor: "#10b981",
        whyText: "Revenue-driven policy to attract investment in domestic semiconductor fabrication facilities.",
        sectors: ["Electronics", "Technology"],
        source: "Ministry of Commerce, India",
        impactType: "positive",
        chartData: [{ name: "Current ($)", value: 82000 }, { name: "Projected ($)", value: 75400 }],
        impactWarning: "Favorable: Optimize India electronics imports immediately to capture margins."
    },
    {
        id: 5,
        tags: [
            { label: "High", type: "high" },
            { label: "Sanctions", type: "neutral" },
            { label: "Negative", type: "negative" }
        ],
        headline: "Russia Sanctions Expanded - Export Control Updates",
        subHeadline: "Additional products added to restricted export list",
        aiSummary: "Dual-use goods and advanced technologies now prohibited. Compliance screening critical for EU/US exporters.",
        effectiveDate: "10/2/2026",
        countries: "Russia, US, EU",
        hsCodes: "8471.xx, 8517.xx, 9026.xx",
        sourceStatus: "Official Verified",
        changedText: "Expanded prohibited list includes 230 new product categories",
        before: "Export allowed with license",
        after: "Completely prohibited",
        costImpact: "Market Access Lost",
        costImpactColor: "#ef4444",
        whyText: "Sanctions escalation in response to geopolitical tensions. Violators face severe penalties.",
        sectors: ["Technology", "Aerospace", "Defense"],
        source: "OFAC / EU Council",
        impactType: "negative",
        chartData: [{ name: "Current ($)", value: 18000 }, { name: "Projected ($)", value: 0 }],
        impactWarning: "Critical: Immediate halt on orders to affected regions to avoid violations."
    }
];

const TIMELINE = [
    { date: "Feb 10, 2026", text: "Russia sanctions expanded", color: "#ef4444" },
    { date: "Feb 20, 2026", text: "India reduces electronics duties", color: "#22c55e" },
    { date: "Mar 15, 2026", text: "Vietnam FTA benefits extended", color: "#22c55e" },
    { date: "Apr 1, 2026", text: "US increases textile tariffs", color: "#ef4444" },
    { date: "Jul 1, 2026", text: "EU CBAM Phase 2 begins", color: "#f59e0b" }
];

const getTagStyle = (type: string) => {
    switch (type) {
        case "high": return { bg: "#fee2e2", color: "#b91c1c", icon: null };
        case "negative": return { bg: "#fee2e2", color: "#b91c1c", icon: <X size={12} style={{ marginRight: 2 }} /> };
        case "medium": return { bg: "#f1f5f9", color: "#475569", icon: null };
        case "neutral": return { bg: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", icon: null };
        case "positive": return { bg: "#dcfce7", color: "#15803d", icon: <Check size={12} style={{ marginRight: 2 }} /> };
        case "mixed": return { bg: "#fef3c7", color: "#b45309", icon: null };
        default: return { bg: "#f1f5f9", color: "#475569", icon: null };
    }
};

/* ── Component ──────────────────────────────────── */
export default function TariffNews() {
    const [newsData, setNewsData] = React.useState<any[]>(NEWS_ITEMS);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/news");
                if (res.ok) {
                    const data = await res.json();
                    if (data.news && data.news.length > 0) {
                        // Transform API response to match UI format
                        const mappedNews = data.news.map((n: any, i: number) => {
                            const p = n.analysis?.extracted_policy || {};
                            const s = n.analysis?.strategic_analysis || {};

                            // Determine impact type based on risk score or tariff direction
                            let impactType = "neutral";
                            let tags: any[] = [];

                            if (p.tariff_direction === "increase" || s.risk_score > 6) {
                                impactType = "negative";
                                tags.push({ label: "High Risk", type: "negative" });
                            } else if (p.tariff_direction === "decrease") {
                                impactType = "positive";
                                tags.push({ label: "Opportunity", type: "positive" });
                            } else {
                                impactType = "mixed";
                                tags.push({ label: "Mixed Impact", type: "mixed" });
                            }

                            tags.push({ label: p.policy_type || "Trade Policy", type: "neutral" });

                            let costImpactColor = impactType === "negative" ? "#ef4444" : impactType === "positive" ? "#10b981" : "#f59e0b";
                            let costImpactStr = p.estimated_tariff_delta_percent ? `${p.estimated_tariff_delta_percent > 0 ? '+' : ''}${p.estimated_tariff_delta_percent}% Duty` : 'Unknown Impact';

                            return {
                                id: i + 100, // avoid clashing with static IDs if mixing
                                tags: tags,
                                headline: n.article.title,
                                subHeadline: `Published: ${new Date(n.article.dateTime).toLocaleDateString()}`,
                                aiSummary: s.impact_summary || "News analyzed, but no direct summary generated.",
                                effectiveDate: p.effective_date || "TBD",
                                countries: (p.affected_countries || []).join(", ") || "Global",
                                hsCodes: (p.likely_affected_hs_chapters || []).map((ch: string) => ch.split(" ")[0]).join(", ") || "Multiple",
                                sourceStatus: "Live Feed",
                                changedText: `${p.tariff_direction?.toUpperCase() || 'CHANGE'} in tariffs expected.`,
                                before: "Current Baseline",
                                after: `${p.estimated_tariff_delta_percent}% Change`,
                                costImpact: costImpactStr,
                                costImpactColor: costImpactColor,
                                whyText: `Winners: ${s.winners || 'N/A'}. Losers: ${s.losers || 'N/A'}.`,
                                sectors: p.affected_sectors || ["General Trade"],
                                source: n.article.source || "The News API",
                                impactType: impactType,
                                impactWarning: s.recommended_actions ? s.recommended_actions[0] : "Review exposure.",
                                fullUrl: n.article.url
                            };
                        });
                        setNewsData(mappedNews);
                    }
                }
            } catch (err) {
                console.error("Failed to load live news, falling back to samples", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <PageShell title="Tariff News">

            {/* Header Box */}
            <div className="glass-card card-shadow animate-fade-in-up" style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Newspaper size={20} color="#2563eb" />
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>Tariff News & Trade Intelligence</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Real-time policy updates with AI-powered interpretation</div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Filter size={14} color="#64748b" />
                    <select style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", background: "transparent", border: "none", outline: "none", cursor: "pointer", appearance: "none", paddingRight: 16 }}>
                        <option>All Updates</option>
                        <option>Apparel & Textiles</option>
                        <option>Electronics</option>
                    </select>
                    <ChevronDown size={14} color="#64748b" style={{ marginLeft: -12, pointerEvents: "none" }} />
                </div>
            </div>

            {/* News Cards with Separate Impact Block */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {loading && (
                    <div className="glass-card card-shadow" style={{ padding: "40px 24px", textAlign: "center", borderRadius: 12 }}>
                        <RefreshCw size={24} className="animate-spin-slow" color="#2563eb" style={{ margin: "0 auto 12px" }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Fetching Live Trade News & Running Policy Diagnostics...</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Connecting to The News API and analyzing impact with MegaLLM.</div>
                    </div>
                )}

                {!loading && newsData.map((item, i) => (
                    <div key={item.id} className={`animate-fade-in-up delay-${(i % 5) * 100}`}>

                        {/* Main News Card */}
                        <div className="glass-card card-shadow" style={{ padding: 24, borderRadius: "12px 12px 0 0", borderBottom: "none" }}>

                            {/* Tags */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                {item.tags.map((tag: any, idx: number) => {
                                    const st = getTagStyle(tag.type);
                                    return (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", background: st.bg, color: st.color, border: (st as any).border || "none", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                                            {st.icon} {tag.label}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Title & Sub */}
                            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{item.headline}</div>
                            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>{item.subHeadline}</div>

                            {/* AI Summary */}
                            <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "16px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <Sparkles size={14} color="#9333ea" />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#7e22ce" }}>AI Summary & Interpretation</span>
                                </div>
                                <div style={{ fontSize: 13, color: "#6b21a8", fontWeight: 500, lineHeight: 1.5 }}>{item.aiSummary}</div>
                            </div>

                            {/* Grid Info */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                                <div style={{ padding: "12px 14px", border: "1px solid #f1f5f9", borderRadius: 8, background: "#f8fafc" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}><Calendar size={12} /> Effective Date</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.effectiveDate}</div>
                                </div>
                                <div style={{ padding: "12px 14px", border: "1px solid #f1f5f9", borderRadius: 8, background: "#f8fafc" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}><Globe size={12} /> Countries</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.countries}</div>
                                </div>
                                <div style={{ padding: "12px 14px", border: "1px solid #f1f5f9", borderRadius: 8, background: "#f8fafc" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}><Hash size={12} /> HS Codes</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.hsCodes}</div>
                                </div>
                                <div style={{ padding: "12px 14px", border: "1px solid #f1f5f9", borderRadius: 8, background: "#f8fafc" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>Source</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.sourceStatus.split(" ")[0]} <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", background: "#dcfce7", padding: "2px 6px", borderRadius: 4 }}>{item.sourceStatus.split(" ")[1]}</span></div>
                                </div>
                            </div>

                            {/* What Changed & Why */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>What Changed vs Before</div>
                                    <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 500, marginBottom: 10 }}>{item.changedText}</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                        <div style={{ border: "1px solid #bfdbfe", borderRadius: 6, padding: "12px", background: "#f8fafc" }}>
                                            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>BEFORE</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.before}</div>
                                        </div>
                                        <div style={{ border: "1px solid #bfdbfe", borderRadius: 6, padding: "12px", background: "#f8fafc" }}>
                                            <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>AFTER</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.after}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: "14px", borderRadius: 8, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                                        💡 Why This Tariff Exists
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{item.whyText}</div>
                                </div>
                            </div>
                        </div>

                        {/* Separate Impact Block (Bottom Attached) */}
                        <div style={{
                            background: item.impactType === 'negative' ? "#fff1f2" : item.impactType === 'positive' ? "#f0fdf4" : "#fffbeb",
                            border: `1px solid ${item.impactType === 'negative' ? "#fecdd3" : item.impactType === 'positive' ? "#bbf7d0" : "#fde68a"}`,
                            borderTop: "none",
                            borderRadius: "0 0 12px 12px",
                            padding: "20px 24px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <ShieldAlert size={18} color={item.impactType === 'negative' ? "#e11d48" : item.impactType === 'positive' ? "#059669" : "#d97706"} />
                                    <span style={{ fontSize: 14, fontWeight: 800, color: item.impactType === 'negative' ? "#e11d48" : item.impactType === 'positive' ? "#059669" : "#d97706" }}>
                                        Business & Financial Impact Analysis
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: item.impactType === 'negative' ? "#e11d48" : item.impactType === 'positive' ? "#059669" : "#d97706", textTransform: "uppercase" }}>Estimated Cost Impact</span>
                                    <span style={{ fontSize: 16, fontWeight: 900, color: item.costImpactColor }}>{item.costImpact}</span>
                                </div>
                            </div>

                            <div style={{ fontSize: 13, color: item.impactType === 'negative' ? "#be123c" : item.impactType === 'positive' ? "#047857" : "#b45309", fontWeight: 600, lineHeight: 1.5, marginBottom: 16 }}>
                                {item.impactWarning}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px dashed ${item.impactType === 'negative' ? "#fecdd3" : item.impactType === 'positive' ? "#bbf7d0" : "#fcd34d"}`, paddingTop: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, color: item.impactType === 'negative' ? "#be123c" : item.impactType === 'positive' ? "#047857" : "#b45309", fontWeight: 700 }}>Affected Sectors:</span>
                                    {item.sectors.map((sec: string) => (
                                        <span key={sec} style={{ fontSize: 10, fontWeight: 700, color: item.impactType === 'negative' ? "#9f1239" : item.impactType === 'positive' ? "#064e3b" : "#92400e", border: `1px solid ${item.impactType === 'negative' ? "#fda4af" : item.impactType === 'positive' ? "#86efac" : "#fcd34d"}`, borderRadius: 4, padding: "2px 8px", background: item.impactType === 'negative' ? "#ffe4e6" : item.impactType === 'positive' ? "#dcfce7" : "#fef3c7" }}>{sec}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer (Actions, Source) */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "0 8px" }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button
                                    onClick={() => item.fullUrl ? window.open(item.fullUrl, '_blank') : null}
                                    style={{ background: "transparent", color: "#1e293b", border: "1.5px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", backgroundColor: "#fff" }}>
                                    View Full Article
                                </button>
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                                Source: {item.source}
                            </div>
                        </div>

                    </div>
                ))}

                {/* Timeline */}
                <div className="glass-card card-shadow animate-fade-in-up delay-500" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <CalendarDays size={18} color="#059669" />
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>Historical Tariff Change Timeline</div>
                    </div>

                    <div style={{ paddingLeft: 12, marginTop: 10 }}>
                        {TIMELINE.map((evt, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 20, position: "relative", marginBottom: idx === TIMELINE.length - 1 ? 0 : 28 }}>
                                {/* Timeline Dot */}
                                <div style={{ width: 12, height: 12, borderRadius: "50%", background: evt.color, zIndex: 1, position: "relative", marginTop: 4 }}>
                                    {idx !== TIMELINE.length - 1 && <div style={{ position: "absolute", top: 12, left: 5, width: 2, height: 28, background: "#e2e8f0" }} />}
                                </div>
                                <div style={{ marginTop: -2 }}>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 2 }}>{evt.date}</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{evt.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </PageShell>
    );
}
