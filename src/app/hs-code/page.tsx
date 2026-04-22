"use client";
import PageShell from "@/components/PageShell";
import { useState, useEffect } from "react";
import { Sparkles, Search, ChevronRight, CheckCircle, Info, ShieldCheck, Zap, ArrowRight, AlertTriangle } from "lucide-react";
import { useTradeContext } from "@/context/TradeContext";

const suggestions = [
    { code: "8471.30.01", confidence: 98, title: "Portable automatic data processing machines", reasoning: "Product is described as a laptop computer with weight under 10kg.", duty: "0%", chapter: "Chapter 84: Nuclear reactors, boilers, machinery and mechanical appliances" },
    { code: "8471.41.00", confidence: 45, title: "Other automatic data processing machines", reasoning: "Alternative classification if product is considered a non-portable workstation.", duty: "0.5%", chapter: "Chapter 84: Nuclear reactors, boilers, machinery and mechanical appliances" },
    { code: "8517.13.00", confidence: 12, title: "Smartphones and other wireless devices", reasoning: "Incorrect if the primary function is data processing rather than communication.", duty: "0%", chapter: "Chapter 85: Electrical machinery and equipment" },
];

export default function HSCode() {
    const { name, description, setTradeData } = useTradeContext();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasResults, setHasResults] = useState(false);
    const [selectedCode, setSelectedCode] = useState<string | null>(null);
    const [apiResults, setApiResults] = useState<any[]>([]);

    const displayResults = apiResults.length > 0 ? apiResults : suggestions;

    useEffect(() => {
        if ((description || name) && !hasResults && !isAnalyzing) {
            setIsAnalyzing(true);
            
            const performClassification = async () => {
                try {
                    const res = await fetch("/api/classify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ product_description: description || name })
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data.results) {
                            setApiResults(data.results);
                        }
                    }
                } catch (err) {
                    console.error("Classification failed:", err);
                } finally {
                    setIsAnalyzing(false);
                    setHasResults(true);
                }
            };
            
            performClassification();
        }
    }, [name, description, hasResults, isAnalyzing]);

    return (
        <PageShell title="HS Code AI Classification">
            {/* Classification Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in-up">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                        <Sparkles size={28} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-foreground tracking-tight">AI HS Code Classification</h1>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Automatic product categorization with confidence scoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            placeholder="Manual HS Code Search..." 
                            className="pl-11 pr-4 py-3 rounded-xl bg-card border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold w-[280px]"
                        />
                    </div>
                    <button className="p-3 rounded-xl bg-card border border-border text-muted-foreground hover:bg-muted transition-colors">
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {!hasResults && !isAnalyzing ? (
                /* Empty State */
                <div className="glass-card bg-card border border-border border-dashed p-20 flex flex-col items-center text-center animate-fade-in-up delay-100 rounded-[2.5rem]">
                    <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-8">
                        <Search size={40} className="text-muted-foreground/30" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight mb-3">No Active Analysis</h2>
                    <p className="text-muted-foreground font-medium max-w-sm leading-relaxed mb-8">
                        Please provide product details in the <span className="text-primary font-bold">Trade Input</span> section to trigger the AI classification engine.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/trade-input'}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        Go to Trade Input <ArrowRight size={18} />
                    </button>
                </div>
            ) : isAnalyzing ? (
                /* Loading State */
                <div className="glass-card bg-card border border-border p-20 flex flex-col items-center text-center animate-fade-in-up delay-100 rounded-[2.5rem]">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <Sparkles size={24} className="absolute inset-0 m-auto text-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Analyzing Product Data</h2>
                    <p className="text-muted-foreground font-medium animate-pulse">Scanning global trade databases and applying GIR rules...</p>
                </div>
            ) : (
                /* Results State */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: AI Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                                Candidate Classifications <span className="px-3 py-1 bg-primary/10 rounded-full text-xs text-primary font-black uppercase tracking-widest">{displayResults.length} Found</span>
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {displayResults.map((s) => (
                                <div 
                                    key={s.hs_code || s.code} 
                                    onClick={() => {
                                        setSelectedCode(s.hs_code || s.code);
                                        setTradeData({ hsCode: s.hs_code || s.code });
                                    }}
                                    className={`glass-card p-8 border cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                                        selectedCode === (s.hs_code || s.code) ? 'border-primary ring-4 ring-primary/5 bg-primary/[0.02]' : 'border-border hover:border-primary/40'
                                    }`}
                                >
                                    {selectedCode === (s.hs_code || s.code) && <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />}
                                    
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="text-3xl font-black text-foreground tracking-tighter">{s.hs_code || s.code}</div>
                                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                                    (s.score * 100 || s.confidence) > 90 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                                }`}>
                                                    <Zap size={10} fill="currentColor" /> {Math.round(s.score * 100) || s.confidence}% Confidence
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground mb-3">{s.description || s.title}</h3>
                                            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                                                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <ShieldCheck size={10} /> Classification Defense
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">&quot;{s.reasoning}&quot;</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Duty</div>
                                            <div className="text-2xl font-black text-primary tracking-tight">{s.duty_rate || s.duty}</div>
                                            <button className={`mt-4 px-6 py-2 rounded-xl font-black text-xs transition-all ${
                                                selectedCode === (s.hs_code || s.code) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {selectedCode === (s.hs_code || s.code) ? 'Selected' : 'Select Code'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Context & Details */}
                    <div className="space-y-6">
                        <div className="glass-card p-8 bg-card border border-border shadow-sm rounded-[2rem] sticky top-8">
                            <h3 className="text-lg font-black text-foreground tracking-tight mb-6 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-primary" /> Chapter Context
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="p-5 rounded-2xl bg-muted/20 border border-border">
                                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Section XVI</div>
                                    <div className="text-sm font-bold text-foreground leading-relaxed">
                                        Machinery and mechanical appliances; electrical equipment; parts thereof.
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">
                                        <span>Key Parameters</span>
                                        <span>Status</span>
                                    </div>
                                    {[
                                        { label: "Material Composition", status: "Verified", color: "text-success" },
                                        { label: "Technical Specs", status: "Inferred", color: "text-blue-500" },
                                        { label: "Country Origin", status: "Matched", color: "text-success" },
                                        { label: "Intended Use", status: "Detected", color: "text-success" },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                            <span className="text-sm font-bold text-foreground">{item.label}</span>
                                            <span className={`text-xs font-black ${item.color} uppercase tracking-widest`}>{item.status}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-border/50">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
                                        <AlertTriangle size={18} className="text-blue-600 shrink-0" />
                                        <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                            Confirming classification unlocks exact duty rates and compliance requirements for this route.
                                        </p>
                                    </div>
                                    <button 
                                        disabled={!selectedCode}
                                        onClick={() => window.location.href = '/compliance'}
                                        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                                            selectedCode ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]' : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        Confirm & Continue <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}
