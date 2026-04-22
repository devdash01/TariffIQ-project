"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutGrid, Globe, Sparkles, ShieldCheck,
    Calculator, TrendingUp, Newspaper, ChevronRight, Activity
} from "lucide-react";

const navItems = [
    { label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    { label: "Trade Input", icon: Globe, href: "/trade-input" },
    { label: "HS Code AI", icon: Sparkles, href: "/hs-code" },
    { label: "Compliance", icon: ShieldCheck, href: "/compliance" },
    { label: "Landed Cost", icon: Calculator, href: "/landed-cost" },
    { label: "Optimize", icon: TrendingUp, href: "/optimize" },
    { label: "Tariff News", icon: Newspaper, href: "/tariff-news" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-[280px] h-screen bg-card border-r border-border flex flex-col shrink-0">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                        <Activity size={22} className="text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="font-extrabold text-xl tracking-tight text-foreground leading-none">
                            TariffIQ
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                            AI Trade Engine
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 overflow-y-auto flex flex-col gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                    ? "bg-primary/10 text-primary border-l-4 border-primary" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent"
                            }`}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
                            <span className={`text-[14px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
                            {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="p-5 border-t border-border flex items-center gap-3 bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
                    A
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">Ayman</div>
                    <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">Trade Analyst</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-success font-bold uppercase tracking-wider">Live</span>
                </div>
            </div>
        </aside>
    );
}
