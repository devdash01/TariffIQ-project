"use client";
import PageShell from "@/components/PageShell";
import { MetricGrid } from "@/components/MetricGrid";
import { ChartsSection } from "@/components/ChartsSection";
import { OptimizationSection } from "@/components/OptimizationSection";

export default function Dashboard() {
    return (
        <PageShell title="Dashboard">
            <MetricGrid />
            <ChartsSection />
            <OptimizationSection />
        </PageShell>
    );
}