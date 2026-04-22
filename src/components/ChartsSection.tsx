"use client";
import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { useTradeContext } from "@/context/TradeContext";

const landedCostData = [
    { name: 'Product Cost', value: 71, color: '#3b82f6' },
    { name: 'Customs Duty', value: 9, color: '#a855f7' },
    { name: 'Import Tax', value: 6, color: '#06b6d4' },
    { name: 'Freight', value: 11, color: '#10b981' },
    { name: 'Insurance', value: 2, color: '#f59e0b' },
    { name: 'Handling', value: 1, color: '#ec4899' },
];

const routeComparisonData = [
    { name: 'Vietnam→US', cost: 14000, color: '#3b82f6' },
    { name: 'India→US', cost: 11500, color: '#10b981' },
    { name: 'China→US', cost: 17500, color: '#3b82f6' },
    { name: 'Mexico→US', cost: 12500, color: '#3b82f6' },
];

export function ChartsSection() {
    const { landedCost, scenarios } = useTradeContext();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]" />;

    // Prepare dynamic landed cost data
    let dynamicLandedCostData = landedCostData;
    if (landedCost) {
        const total = landedCost.total_landed_cost;
        dynamicLandedCostData = [
            { name: 'Product Cost', value: Math.round((landedCost.product_value / total) * 100), color: '#3b82f6' },
            { name: 'Customs Duty', value: Math.round((landedCost.import_duty / total) * 100), color: '#a855f7' },
            { name: 'Import Tax', value: Math.round((landedCost.import_vat / total) * 100), color: '#06b6d4' },
            { name: 'Freight', value: Math.round((landedCost.shipping_cost / total) * 100), color: '#10b981' },
            { name: 'Insurance', value: Math.round((landedCost.insurance_cost / total) * 100), color: '#f59e0b' },
            { name: 'Handling/Fees', value: Math.round(((landedCost.handling_fees + landedCost.doc_fees) / total) * 100), color: '#ec4899' },
        ].filter(d => d.value > 0);
    }

    // Prepare dynamic comparison data
    let dynamicComparisonData = routeComparisonData;
    if (scenarios && scenarios.length > 0) {
        dynamicComparisonData = scenarios.map((s, i) => ({
            name: s.route.split(" -> ")[0] + (s.mode === 'air' ? ' (Air)' : ''),
            cost: s.total_landed_cost,
            color: i === 0 ? '#3b82f6' : '#10b981'
        })).slice(0, 4);
    }

    const bestScenario = scenarios && scenarios.length > 0 
        ? [...scenarios].sort((a, b) => a.total_landed_cost - b.total_landed_cost)[0]
        : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Landed Cost Breakdown */}
            <div className="glass-card p-8 bg-card border border-border shadow-sm rounded-2xl flex flex-col animate-fade-in-up delay-200">
                <div className="mb-6">
                    <h3 className="text-xl font-extrabold text-foreground tracking-tight">Landed Cost Breakdown</h3>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Total cost composition for current trade route</p>
                </div>
                
                <div className="flex flex-1 items-center gap-12">
                    <div className="w-1/2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dynamicLandedCostData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {dynamicLandedCostData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3.5">
                        {dynamicLandedCostData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-foreground">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Route Cost Comparison */}
            <div className="glass-card p-8 bg-card border border-border shadow-sm rounded-2xl flex flex-col animate-fade-in-up delay-300">
                <div className="mb-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-extrabold text-foreground tracking-tight">Route Cost Comparison</h3>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Optimized alternatives vs. current route</p>
                    </div>
                </div>

                <div className="flex-1 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dynamicComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 800, fill: 'oklch(0.45 0.02 252)' }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 800, fill: 'oklch(0.45 0.02 252)' }}
                                tickFormatter={(val) => `$${val/1000}k`}
                            />
                            <Tooltip 
                                cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                                contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    borderColor: 'var(--border)',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar 
                                dataKey="cost" 
                                radius={[8, 8, 0, 0]} 
                                barSize={44}
                                animationBegin={300}
                                animationDuration={1200}
                            >
                                {dynamicComparisonData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[15px] font-extrabold text-success tracking-tight">
                            Best: {bestScenario ? `${bestScenario.route.split(" -> ")[0]} — $${bestScenario.total_landed_cost.toLocaleString()}` : "India → US — $11,500"}
                        </span>
                    </div>
                    {bestScenario && (
                        <span className="text-[11px] font-black text-success px-3 py-1 rounded-full bg-success/10 border border-success/20 uppercase tracking-widest shadow-sm">
                            Best ROI Route
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}