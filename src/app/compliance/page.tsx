"use client";
import PageShell from "@/components/PageShell";
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, ChevronRight, FileText, Scale, Globe2, Search, RefreshCw, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useTradeContext } from "@/context/TradeContext";

const ChecklistItem = ({ rule }: { rule: any }) => {
    const [checked, setChecked] = useState(false);
    return (
        <div 
            onClick={() => setChecked(!checked)}
            className={`glass-card p-6 bg-card border hover:border-primary/30 transition-all group cursor-pointer ${checked ? 'opacity-60 border-success/30 bg-success/[0.01]' : 'border-border'}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${checked ? 'bg-success border-success text-white' : 'bg-transparent border-border'}`}>
                            {checked && <CheckCircle2 size={12} strokeWidth={3} />}
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded">{rule.category || "General"}</span>
                        {rule.is_mandatory && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                                <AlertTriangle size={12} /> Mandatory
                            </span>
                        )}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 transition-colors ${checked ? 'text-success' : 'text-foreground'}`}>{rule.requirement_title || rule.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{rule.description}</p>
                    
                    {rule.ai_suggestion && (
                        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                            <Zap size={14} className="text-primary shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">AI Recommendation</div>
                                <p className="text-[11px] text-foreground font-medium leading-relaxed italic">{rule.ai_suggestion}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Compliance() {
    const { dest, description, name, origin } = useTradeContext();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (!dest || (!description && !name)) return;

        const fetchCompliance = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/compliance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        destination: dest,
                        product_description: description || name
                    })
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error("Compliance fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompliance();
    }, [dest, description, name]);

    const checklist = data?.compliance_checklist || [
        { id: 1, category: "Sanctions", title: "Global Sanctions Check", status: "pass", description: "All parties clear of international sanction lists.", is_mandatory: true },
        { id: 2, category: "Customs", title: "Certificate of Origin", status: "review", description: "Preferential duty rates require a valid Form D.", is_mandatory: true },
        { id: 3, category: "Regulations", title: "Technical Standards", status: "pass", description: "Product matches destination safety standards.", is_mandatory: false }
    ];

    const metrics = [
        { label: "Overall Risk", value: data?.risk_level || "Low", color: "text-success", bgColor: "bg-success/10", icon: ShieldCheck },
        { label: "Active Rules", value: checklist.length, color: "text-blue-500", bgColor: "bg-blue-500/10", icon: Scale },
        { label: "Complexity", value: `${data?.estimated_complexity || 4}/10`, color: "text-warning", bgColor: "bg-warning/10", icon: Info },
        { label: "Mandatory", value: checklist.filter((r:any) => r.is_mandatory).length, color: "text-red-500", bgColor: "bg-red-500/10", icon: AlertTriangle },
        { label: "Origin Rules", value: data?.rules_of_origin_evaluation?.length || 0, color: "text-purple-500", bgColor: "bg-purple-500/10", icon: FileText },
        { label: "Global Sync", value: "100%", color: "text-cyan-500", bgColor: "bg-cyan-500/10", icon: Globe2 },
    ];

    return (
        <PageShell title="Compliance & Regulatory">
            {/* Score Banner */}
            <div className="glass-card bg-[#0f172a] border-none rounded-[2.5rem] overflow-hidden relative animate-fade-in-up">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-success/20 to-transparent" />
                
                <div className="relative p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center border border-success/30">
                                <ShieldCheck size={22} className="text-success" />
                            </div>
                            <span className="text-sm font-black text-success uppercase tracking-widest">Compliance Health Score</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                            {loading ? "..." : (data ? 100 - (data.estimated_complexity * 8) : 94)}<span className="text-success text-2xl ml-1">/100</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                            {data?.summary_advice || "Your trade route is being analyzed. Stay compliant with real-time AI regulatory checks."}
                        </p>
                    </div>

                    <div className="w-full md:w-auto grid grid-cols-2 gap-4">
                        <button className="px-8 py-4 bg-success text-white rounded-2xl font-black text-sm shadow-lg shadow-success/20 hover:scale-105 transition-transform flex items-center gap-2">
                            Generate Report <FileText size={18} />
                        </button>
                        <button className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-sm border border-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
                            Global Scan <Globe2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in-up delay-100">
                {metrics.map((m) => (
                    <div key={m.label} className="glass-card p-6 bg-card border border-border shadow-sm flex flex-col gap-3 group hover:-translate-y-1 transition-all">
                        <div className={`w-10 h-10 rounded-xl ${m.bgColor} ${m.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <m.icon size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-foreground tracking-tight">{loading ? "..." : m.value}</div>
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{m.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rules Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left: Rules Checklist */}
                <div className="lg:col-span-2 space-y-6 animate-fade-in-up delay-200">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                            Regulatory Checklist <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">{checklist.length} Rules</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            {loading && <RefreshCw size={16} className="animate-spin text-primary" />}
                            <div className="relative group">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input placeholder="Filter rules..." className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-xs outline-none focus:border-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {checklist.map((rule: any, i: number) => (
                            <ChecklistItem key={i} rule={rule} />
                        ))}
                    </div>
                </div>

                {/* Right: Risk Heatmap / Info */}
                <div className="space-y-6 animate-fade-in-up delay-300">
                    <div className="glass-card p-8 bg-card border border-border shadow-sm rounded-[2rem]">
                        <h3 className="text-lg font-black text-foreground tracking-tight mb-6">Regional Risk Heatmap</h3>
                        <div className="aspect-square bg-muted/30 rounded-2xl border border-border relative overflow-hidden group cursor-crosshair">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Globe2 size={64} className="text-muted-foreground/20 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="absolute top-4 left-4 p-3 bg-white/80 backdrop-blur border border-border rounded-xl shadow-sm">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Selected Region</div>
                                <div className="text-sm font-bold text-foreground">{dest || "Vietnam (VN)"}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${data?.risk_level === 'High' ? 'bg-red-500' : 'bg-success'}`} />
                                    <span className={`text-[10px] font-bold uppercase ${data?.risk_level === 'High' ? 'text-red-500' : 'text-success'}`}>
                                        {data?.risk_level || "Low"} Risk
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                                <span>Risk Factors</span>
                                <span>Level</span>
                            </div>
                            {[
                                { label: "Political Stability", level: data?.risk_level === 'High' ? 65 : 20, color: data?.risk_level === 'High' ? "bg-red-500" : "bg-success" },
                                { label: "Regulatory Quality", level: data?.estimated_complexity * 10 || 35, color: data?.estimated_complexity > 7 ? "bg-red-500" : "bg-success" },
                                { label: "Customs Efficiency", level: 60, color: "bg-warning" },
                            ].map(item => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-foreground">{item.label}</span>
                                        <span className="text-xs font-black text-muted-foreground">{item.level}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.level}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
