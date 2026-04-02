"use client";
import { useEffect, useState } from "react";
import { TrendingDown, DollarSign, AlertTriangle, Zap, TrendingUp } from "lucide-react";

const metrics = [
    {
        label: "Potential Savings",
        value: 5240,
        display: (n: number) => `$${n.toLocaleString()}`,
        sub: "vs. current route",
        trend: "+12.4%",
        positive: true,
        icon: TrendingDown,
        color: "#10b981",
        colorBg: "rgba(16,185,129,0.1)",
        colorBorder: "rgba(16,185,129,0.25)",
    },
    {
        label: "Total Landed Cost",
        value: 14000,
        display: (n: number) => `$${n.toLocaleString()}`,
        sub: "optimized estimate",
        trend: "−8.2%",
        positive: true,
        icon: DollarSign,
        color: "#3b82f6",
        colorBg: "rgba(59,130,246,0.1)",
        colorBorder: "rgba(59,130,246,0.25)",
    },
    {
        label: "Compliance Risk",
        value: null,
        display: () => "Low",
        sub: "2 items need review",
        trend: "2 alerts",
        positive: false,
        icon: AlertTriangle,
        color: "#f59e0b",
        colorBg: "rgba(245,158,11,0.1)",
        colorBorder: "rgba(245,158,11,0.25)",
    },
    {
        label: "Active Alerts",
        value: 7,
        display: (n: number) => `${n}`,
        sub: "3 flagged high priority",
        trend: "−2 today",
        positive: true,
        icon: Zap,
        color: "#a855f7",
        colorBg: "rgba(168,85,247,0.1)",
        colorBorder: "rgba(168,85,247,0.25)",
    },
];

function useCountUp(target: number | null, delay = 0) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === null) return;
        const timeout = setTimeout(() => {
            let n = 0;
            const step = Math.ceil(target / 60);
            const timer = setInterval(() => {
                n = Math.min(n + step, target);
                setCount(n);
                if (n >= target) clearInterval(timer);
            }, 16);
            return () => clearInterval(timer);
        }, delay);
        return () => clearTimeout(timeout);
    }, [target, delay]);
    return count;
}

function Card({ m, delay }: { m: typeof metrics[0]; delay: number }) {
    const count = useCountUp(m.value, delay);

    return (
        <div
            className="glass-card card-shadow animate-fade-in-up shimmer-hover"
            style={{
                padding: "20px 22px",
                animationDelay: `${delay}ms`,
                cursor: "default",
                borderTop: `2px solid ${m.color}`,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: m.colorBg,
                        border: `1px solid ${m.colorBorder}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: m.color,
                    }}
                >
                    <m.icon size={16} strokeWidth={1.8} />
                </div>
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: 99,
                        background: m.positive ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                        color: m.positive ? "#10b981" : "#f59e0b",
                        border: `1px solid ${m.positive ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                    }}
                >
                    {m.trend}
                </span>
            </div>

            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, color: "var(--text-primary)", lineHeight: 1 }}>
                {m.display(count)}
            </div>
            <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{m.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{m.sub}</div>
            </div>
        </div>
    );
}

export function MetricGrid() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {metrics.map((m, i) => <Card key={m.label} m={m} delay={i * 80} />)}
        </div>
    );
}