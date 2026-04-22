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
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar title={title} />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-8 min-h-min">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
