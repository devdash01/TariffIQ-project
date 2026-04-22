"use client";
import PageShell from "@/components/PageShell";
import { ShieldCheck, AlertTriangle, CheckCircle2, Info, ChevronRight, FileText, Scale, Globe2, Search } from "lucide-react";

const complianceRules = [
    { id: 1, category: "Sanctions & Restricted Parties", title: "Global Sanctions Check", status: "pass", description: "All parties in this trade route (Origin: Vietnam, Dest: USA) are clear of international sanction lists." },
    { id: 2, category: "Product Regulations", title: "FDA Bioterrorism Act Compliance", status: "review", description: "Food-grade items require prior notice filing with the FDA. Registration number needs verification." },
    { id: 3, category: "Import Duties", title: "Section 301 Tariff Evaluation", status: "pass", description: "Product is not subject to Section 301 additional duties for Vietnam origin." },
    { id: 4, category: "Documentation", title: "Certificate of Origin (Form D)", status: "review", description: "Preferential duty rates require a valid Form D. Please upload to confirm eligibility." },
];

const metrics = [
    { label: "Overall Risk", value: "Low", color: "text-success", bgColor: "bg-success/10", icon: ShieldCheck },
    { label: "Active Rules", value: "24", color: "text-blue-500", bgColor: "bg-blue-500/10", icon: Scale },
    { label: "Critical Alerts", value: "0", color: "text-success", bgColor: "bg-success/10", icon: AlertTriangle },
    { label: "Review Required", value: "2", color: "text-warning", bgColor: "bg-warning/10", icon: Info },
    { label: "Certifications", value: "3/4", color: "text-purple-500", bgColor: "bg-purple-500/10", icon: FileText },
    { label: "Global Coverage", value: "100%", color: "text-cyan-500", bgColor: "bg-cyan-500/10", icon: Globe2 },
];

export default function Compliance() {
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
                            94<span className="text-success text-2xl ml-1">/100</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                            Your trade route is highly compliant. Only 2 minor documentation reviews are pending to reach perfect standing.
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
                            <div className="text-2xl font-black text-foreground tracking-tight">{m.value}</div>
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
                            Regulatory Checklist <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">4 Rules</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input placeholder="Filter rules..." className="pl-9 pr-4 py-2 rounded-xl bg-muted/50 border border-border text-xs outline-none focus:border-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {complianceRules.map((rule) => (
                            <div key={rule.id} className="glass-card p-6 bg-card border border-border hover:border-primary/30 transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded">{rule.category}</span>
                                            {rule.status === 'pass' ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-success uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> Passed
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-warning uppercase tracking-widest animate-pulse">
                                                    <AlertTriangle size={12} /> Needs Review
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">{rule.title}</h3>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{rule.description}</p>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
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
                                <div className="text-sm font-bold text-foreground">Vietnam (VN)</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-success" />
                                    <span className="text-[10px] font-bold text-success uppercase">Low Risk</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                                <span>Risk Factors</span>
                                <span>Level</span>
                            </div>
                            {[
                                { label: "Political Stability", level: 20, color: "bg-success" },
                                { label: "Regulatory Quality", level: 35, color: "bg-success" },
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
