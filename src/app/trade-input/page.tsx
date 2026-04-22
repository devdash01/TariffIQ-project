"use client";
import PageShell from "@/components/PageShell";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Sparkles, Package, DollarSign, MapPin, Weight, CheckCircle, RefreshCw, ChevronDown, UploadCloud } from "lucide-react";
import { useTradeContext } from "@/context/TradeContext";

/* ── helpers ── */
const CATEGORIES = ["Select category", "Electronics & IT", "Apparel & Textiles", "Machinery", "Chemicals", "Food & Beverage", "Automotive Parts", "Medical Devices", "Furniture", "Toys & Games", "Other"];
const CURRENCIES = ["USD - US Dollar", "EUR - Euro", "GBP - Pound Sterling", "AED - UAE Dirham", "INR - Indian Rupee", "CNY - Chinese Yuan"];
const ALL_COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina",
    "Brazil", "Bulgaria", "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia",
    "Costa Rica", "Croatia", "Cuba", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador",
    "Egypt", "El Salvador", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany",
    "Ghana", "Greece", "Guatemala", "Honduras", "Hong Kong", "Hungary", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan", "Latvia", "Lebanon", "Libya", "Lithuania",
    "Luxembourg", "Malaysia", "Malta", "Mexico", "Moldova", "Mongolia", "Morocco", "Mozambique",
    "Myanmar", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Nigeria", "North Korea",
    "Norway", "Oman", "Pakistan", "Panama", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Senegal", "Serbia", "Singapore",
    "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tunisia",
    "Turkey", "Turkmenistan", "United Arab Emirates", "Uganda", "United Kingdom", "Ukraine", "Uruguay", "United States", "Uzbekistan",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];
const ORIGINS = ["Select origin", ...ALL_COUNTRIES];
const DESTS = ["Select destination", ...ALL_COUNTRIES];
const TRANSPORTS = ["Select transport mode", "Sea Freight", "Air Freight"];

function Input({ placeholder, value, onChange, prefix }: { placeholder: string; value: string; onChange: (v: string) => void; prefix?: string }) {
    return (
        <div className="relative group">
            {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">{prefix}</span>}
            <input 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                className={`w-full ${prefix ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground/60`}
            />
        </div>
    );
}

function Select({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative group">
            <select 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-foreground appearance-none cursor-pointer"
            >
                {options.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
        </div>
    );
}

function SectionHeader({ icon: Icon, title, colorClass }: { icon: any; title: string; colorClass: string }) {
    return (
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
            <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                <Icon size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold text-foreground tracking-tight">{title}</span>
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            {children}
        </div>
    );
}

export default function TradeInput() {
    const router = useRouter();
    const tradeContext = useTradeContext();

    const isStandardCategory = CATEGORIES.includes(tradeContext.category);

    const [f, setF] = useState({
        name: tradeContext.name || "",
        category: isStandardCategory ? tradeContext.category : "Other",
        customCategory: isStandardCategory ? "" : tradeContext.category,
        description: tradeContext.description || "",
        material: tradeContext.material || "",
        intendedUse: tradeContext.intendedUse || "",
        value: tradeContext.value || "",
        currency: tradeContext.currency || CURRENCIES[0],
        qty: tradeContext.qty || "",
        weight: tradeContext.weight || "",
        dimensions: tradeContext.dimensions || "",
        origin: tradeContext.origin || ORIGINS[0],
        dest: tradeContext.dest || DESTS[0],
        transport: tradeContext.transport || TRANSPORTS[0],
    });
    const set = (k: keyof typeof f) => (v: string) => { setF(p => ({ ...p, [k]: v })); };

    const [running, setRunning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFile = async (file: File) => {
        if (!file || file.type !== "application/pdf") return;
        setIsParsing(true);
        setTimeout(() => {
            setIsParsing(false);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
        }, 1500);
    };

    const canRun = !!(f.name && f.value && f.qty && f.origin !== ORIGINS[0] && f.dest !== DESTS[0] && f.transport !== TRANSPORTS[0]);

    function analyze() {
        if (!canRun || running) return;
        setRunning(true);
        tradeContext.setTradeData({
            ...f,
            category: f.category === "Other" ? f.customCategory : f.category
        });
        setTimeout(() => {
            setRunning(false);
            router.push("/hs-code");
        }, 1000);
    }

    return (
        <PageShell title="Trade Input">
            {/* Header */}
            <div className="flex items-center gap-5 animate-fade-in-up">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                    <Globe size={28} className="text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">Core Trade Input & Setup</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Enter your product and trade details for AI-powered analysis</p>
                </div>
            </div>

            {/* Form Container */}
            <div className="glass-card bg-card p-10 border border-border shadow-xl rounded-[2rem] animate-fade-in-up delay-100">
                
                {/* Upload Zone */}
                <div
                    className={`mb-12 p-10 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center text-center gap-4 group cursor-pointer ${
                        isDragging ? "border-primary bg-primary/5" : uploadSuccess ? "border-success bg-success/5" : "border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                >
                    {isParsing ? (
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw size={40} className="text-primary animate-spin" />
                            <div className="text-lg font-bold text-foreground">Extracting Data with AI...</div>
                            <div className="text-sm text-muted-foreground font-medium">MegaLLM is reading your document</div>
                        </div>
                    ) : uploadSuccess ? (
                        <div className="flex flex-col items-center gap-3">
                            <CheckCircle size={40} className="text-success" />
                            <div className="text-lg font-bold text-success">Extraction Successful</div>
                            <div className="text-sm text-success/80 font-medium">Form fields have been populated</div>
                        </div>
                    ) : (
                        <>
                            <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center border border-border group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="text-xl font-black text-foreground tracking-tight">Upload Invoice or Spec Sheet</div>
                            <div className="text-[13px] text-muted-foreground font-medium max-w-sm leading-relaxed">
                                Drop a PDF document here to automatically extract and populate the trade fields below using MegaLLM.
                            </div>
                            <label className="mt-4 px-6 py-2.5 bg-white border border-border rounded-xl text-xs font-black text-foreground hover:bg-muted transition-colors cursor-pointer shadow-sm">
                                Browse Files
                                <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            </label>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                    {/* Left Column: Product Info */}
                    <div className="space-y-10">
                        <div>
                            <SectionHeader icon={Package} title="Product Information" colorClass="bg-blue-600 shadow-blue-500/30" />
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Product Name" required>
                                        <Input placeholder="e.g., Cotton T-Shirts" value={f.name} onChange={set("name")} />
                                    </Field>
                                    <Field label="Product Category" required>
                                        <Select options={CATEGORIES} value={f.category} onChange={set("category")} />
                                    </Field>
                                </div>
                                <Field label="Product Description" required>
                                    <textarea
                                        value={f.description}
                                        onChange={e => set("description")(e.target.value)}
                                        placeholder="Detailed specifications, characteristics, and materials..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground/60 resize-none"
                                    />
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Material / Composition">
                                        <Input placeholder="e.g., 100% Cotton" value={f.material} onChange={set("material")} />
                                    </Field>
                                    <Field label="Intended Use">
                                        <Input placeholder="e.g., Retail" value={f.intendedUse} onChange={set("intendedUse")} />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionHeader icon={Weight} title="Weight & Dimensions" colorClass="bg-purple-600 shadow-purple-500/30" />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Total Weight (kg)" required>
                                    <Input placeholder="0.0" value={f.weight} onChange={set("weight")} />
                                </Field>
                                <Field label="Dimensions (L×W×H)" >
                                    <Input placeholder="e.g., 50×40×30" value={f.dimensions} onChange={set("dimensions")} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Value & Route */}
                    <div className="space-y-10">
                        <div>
                            <SectionHeader icon={DollarSign} title="Value & Quantity" colorClass="bg-success shadow-success/30" />
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <Field label="Unit Price" required>
                                        <Input placeholder="0.00" prefix="$" value={f.value} onChange={set("value")} />
                                    </Field>
                                </div>
                                <Field label="Quantity" required>
                                    <Input placeholder="0" value={f.qty} onChange={set("qty")} />
                                </Field>
                            </div>
                        </div>

                        <div>
                            <SectionHeader icon={MapPin} title="Routing Information" colorClass="bg-warning shadow-warning/30" />
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Origin" required>
                                        <Select options={ORIGINS} value={f.origin} onChange={set("origin")} />
                                    </Field>
                                    <Field label="Destination" required>
                                        <Select options={DESTS} value={f.dest} onChange={set("dest")} />
                                    </Field>
                                </div>
                                <Field label="Transport Mode" required>
                                    <Select options={TRANSPORTS} value={f.transport} onChange={set("transport")} />
                                </Field>
                            </div>
                        </div>

                        <div className="pt-10 flex gap-4 border-t border-border/50">
                            <button
                                onClick={analyze}
                                disabled={!canRun || running}
                                className={`flex-1 py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                                    canRun && !running 
                                        ? "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90" 
                                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                }`}
                            >
                                {running ? (
                                    <><RefreshCw size={20} className="animate-spin" /> Analyzing Route...</>
                                ) : (
                                    <><Sparkles size={20} /> Analyze Trade Route</>
                                )}
                            </button>
                            <button className="px-6 py-4 rounded-2xl border border-border bg-muted/20 font-bold text-sm text-muted-foreground hover:bg-muted/40 transition-colors shadow-sm">
                                Save Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
