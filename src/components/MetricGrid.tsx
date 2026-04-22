"use client";
import { useEffect, useState } from "react";
import { TrendingDown, DollarSign, AlertTriangle, Zap } from "lucide-react";

const metrics = [
    {
        label: "Potential Savings",
        value: 5240,
        display: (n: number) => `$${n.toLocaleString()}`,
        sub: "vs. current route",
        trend: "+12.4%",
        positive: true,
        icon: TrendingDown,
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        accentColor: "border-t-success",
    },
    {
        label: "Total Landed Cost",
        value: 14000,
        display: (n: number) => `$${n.toLocaleString()}`,
        sub: "optimized estimate",
        trend: "-8.2%",
        positive: true,
        icon: DollarSign,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        accentColor: "border-t-blue-500",
    },
    {
        label: "Compliance Risk",
        value: null,
        display: () => "Low",
        sub: "2 items need review",
        trend: "2 alerts",
        positive: false,
        icon: AlertTriangle,
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        accentColor: "border-t-warning",
    },
    {
        label: "Active Alerts",
        value: 7,
        display: (n: number) => `${n}`,
        sub: "3 flagged high priority",
        trend: "-2 today",
        positive: true,
        icon: Zap,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        accentColor: "border-t-purple-500",
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
            className={`glass-card p-6 bg-card border border-border ${m.accentColor} border-t-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${m.bgColor} border ${m.borderColor} flex items-center justify-center ${m.color}`}>
                    <m.icon size={20} strokeWidth={2} />
                </div>
                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${m.positive ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"}`}>
                    {m.trend}
                </span>
            </div>

            <div className="text-3xl font-extrabold tracking-tight text-foreground leading-none">
                {m.display(count)}
            </div>
            <div className="mt-4">
                <div className="text-[15px] font-bold text-foreground">{m.label}</div>
                <div className="text-[12px] text-muted-foreground mt-1 font-medium">{m.sub}</div>
            </div>
        </div>
    );
}

export function MetricGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => <Card key={m.label} m={m} delay={i * 100} />)}
        </div>
    );
}