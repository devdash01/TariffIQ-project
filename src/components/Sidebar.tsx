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
        <aside
            className="animate-fade-in"
            style={{
                width: 260, minWidth: 260, height: "100vh",
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border)",
                display: "flex", flexDirection: "column",
                flexShrink: 0,
                zoom: 1.15,
            }}
        >
            {/* Logo */}
            <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: "#2563eb",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        <Activity size={22} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)", lineHeight: 1 }}>
                            TariffIQ
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 600 }}>
                            AI Trade Engine
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
                {navItems.map((item, i) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`animate-fade-in delay-${Math.min((i + 1) * 100, 800)}`}
                            style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "12px 14px", borderRadius: 10,
                                textDecoration: "none",
                                transition: "all 0.15s ease",
                                background: isActive ? "rgba(37,99,235,0.08)" : "transparent",
                                borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                                color: isActive ? "#2563eb" : "var(--text-muted)",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.04)";
                                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                                }
                            }}
                        >
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span style={{ fontSize: 15, fontWeight: isActive ? 700 : 600 }}>{item.label}</span>
                            {isActive && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />}
                        </Link>
                    );
                })}
            </nav>

            {/* User footer */}
            <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0,
                }}>A</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Ayman</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Trade Analyst</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669" }} />
                    <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>Live</span>
                </div>
            </div>
        </aside>
    );
}
