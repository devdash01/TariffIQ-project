import { TradeProvider } from "@/context/TradeContext";
import "./globals.css";

export const metadata = {
    title: "TariffIQ — AI-Powered Trade Optimization",
    description: "Real-time AI decision engine for tariff analysis, route optimization, and trade compliance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <TradeProvider>
                    {children}
                </TradeProvider>
            </body>
        </html>
    );
}