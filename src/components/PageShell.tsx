"use client";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/Navbar";

export default function PageShell({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) {
    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
            <Sidebar />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <TopBar title={title} />
                <main style={{ flex: 1, overflowY: "auto", padding: "32px", zoom: 1.25 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 28, minHeight: "min-content" }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
