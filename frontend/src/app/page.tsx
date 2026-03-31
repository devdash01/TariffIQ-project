"use client";
import Link from 'next/link';
import { ArrowRight, Globe, ShieldCheck, Sparkles, TrendingUp, Cpu, Activity, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
    <div
        className={`glass-card card-shadow animate-fade-in-up`}
        style={{
            animationDelay: `${delay}ms`,
            padding: '32px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.1)';
        }}
    >
        <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <Icon size={28} color="#60a5fa" />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, fontWeight: 500 }}>{description}</p>
    </div>
);

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020617', // Very dark slate
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            overflowX: 'hidden',
            position: 'relative'
        }}>
            {/* Dynamic Background Effects */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(2,6,23,0) 70%)',
                    borderRadius: '50%', filter: 'blur(80px)', animation: 'pulse 8s infinite alternate'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(2,6,23,0) 70%)',
                    borderRadius: '50%', filter: 'blur(100px)', animation: 'pulse 12s infinite alternate-reverse'
                }} />

                {/* Grid Overlay */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                    maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
                }} />
            </div>

            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                padding: '20px 0',
                transition: 'all 0.3s ease',
                background: scrolled ? 'rgba(2,6,23,0.8)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'
            }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: '0 0 20px rgba(59,130,246,0.5)'
                        }}>
                            <Activity size={20} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: '-0.02em' }}>TariffIQ</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: '14px', fontWeight: 600, color: '#cbd5e1' }}>
                        <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>Features</a>
                        <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>How it Works</a>
                        <Link href="/login" passHref>
                            <button style={{
                                padding: '10px 24px', borderRadius: '8px',
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                            >
                                Sign In
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '160px 32px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

                {/* Floating Elements (Background Visuals) */}
                <div className="animate-fade-in-up delay-500" style={{
                    position: 'absolute', top: '15%', left: '5%',
                    padding: '16px 20px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', transform: 'rotate(-5deg)',
                    animation: 'float 6s ease-in-out infinite'
                }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={20} color="#4ade80" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Landed Cost Reduced</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80' }}>-14.2%</div>
                    </div>
                </div>

                <div className="animate-fade-in-up delay-700" style={{
                    position: 'absolute', top: '25%', right: '5%',
                    padding: '16px 20px', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)', transform: 'rotate(5deg)',
                    animation: 'float 8s ease-in-out infinite alternate-reverse'
                }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={20} color="#c084fc" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Compliance Score</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#c084fc' }}>99.8% safe</div>
                    </div>
                </div>

                <div className="animate-fade-in-up" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', borderRadius: '100px',
                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd', fontSize: '13px', fontWeight: 700, marginBottom: '32px',
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                    <Globe size={14} /> Global Trade Intelligence
                </div>

                <h1 className="animate-fade-in-up delay-100" style={{
                    fontSize: 'clamp(64px, 10vw, 120px)', fontWeight: 900, lineHeight: 1,
                    letterSpacing: '-0.04em', marginBottom: '16px', maxWidth: '900px',
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10
                }}>
                    Tariff<span style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        paddingRight: '10px'
                    }}>IQ</span>
                </h1>

                <p className="animate-fade-in-up delay-200" style={{
                    fontSize: 'clamp(18px, 3vw, 24px)', color: '#cbd5e1', lineHeight: 1.6,
                    maxWidth: '700px', marginBottom: '48px', fontWeight: 600, letterSpacing: '-0.01em', position: 'relative', zIndex: 10
                }}>
                    AI-Powered Trade Optimization
                </p>

                <div className="animate-fade-in-up delay-300" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link href="/login" passHref>
                        <button style={{
                            padding: '16px 36px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2563eb, #6366f1)', border: 'none',
                            color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.6)',
                            transition: 'all 0.3s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px -10px rgba(37, 99, 235, 0.8)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(37, 99, 235, 0.6)'; }}
                        >
                            Get Started Free <ArrowRight size={18} />
                        </button>
                    </Link>
                    <Link href="/dashboard" passHref>
                        <button style={{
                            padding: '16px 36px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.2s ease', backdropFilter: 'blur(10px)'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        >
                            Explore Dashboard
                        </button>
                    </Link>
                </div>

                {/* Dashboard Preview Image/Mockup */}
                <div className="animate-fade-in-up delay-400" style={{
                    marginTop: '80px', width: '100%', maxWidth: '1100px', height: '500px',
                    borderRadius: '24px', background: 'linear-gradient(to bottom, rgba(30,41,59,0.8), rgba(15,23,42,0.6))',
                    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                }}>
                    {/* Mock Browser Header */}
                    <div style={{ height: 48, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                    </div>
                    {/* Abstract Content indicating a powerful dashboard */}
                    <div style={{ flex: 1, padding: '24px', display: 'flex', gap: 20 }}>
                        {/* Mock Sidebar */}
                        <div style={{ width: 220, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ height: 24, width: '60%', background: 'rgba(59,130,246,0.3)', borderRadius: 6, marginBottom: 16 }} />
                            {[...Array(5)].map((_, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 16, height: 16, borderRadius: 4, background: i === 0 ? '#3b82f6' : 'rgba(255,255,255,0.1)' }} />
                                    <div style={{ height: 12, width: i % 2 === 0 ? '70%' : '50%', background: i === 0 ? '#fff' : 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                                </div>
                            ))}
                        </div>

                        {/* Mock Main Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Mock Header/Metrics */}
                            <div style={{ display: 'flex', gap: 20 }}>
                                {[
                                    { color: '#3b82f6', label: 'Optimization Potential' },
                                    { color: '#10b981', label: 'Landed Cost Savings' },
                                    { color: '#8b5cf6', label: 'Compliance Checks' }
                                ].map((metric, i) => (
                                    <div key={i} style={{ flex: 1, height: 110, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>{metric.label}</div>
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                                            <div style={{ height: 32, width: '40%', background: metric.color, borderRadius: 6, opacity: 0.8 }} />
                                            <div style={{ height: 16, width: '20%', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mock Charts Area */}
                            <div style={{ display: 'flex', gap: 20, flex: 1 }}>
                                {/* Big Line Chart Area */}
                                <div style={{ flex: 2, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ height: 16, width: '30%', background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 24 }} />

                                    {/* SVG Mock Line Chart */}
                                    <svg width="100%" height="100%" style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.5 }}>
                                        <path d="M0,150 C50,120 100,160 150,100 C200,40 250,90 300,50 C350,10 400,60 500,20 L500,200 L0,200 Z" fill="url(#grad1)" />
                                        <path d="M0,150 C50,120 100,160 150,100 C200,40 250,90 300,50 C350,10 400,60 500,20" fill="none" stroke="#3b82f6" strokeWidth="3" />
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>

                                {/* Side Data Column */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ height: 10, width: '80%', background: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 6 }} />
                                                <div style={{ height: 8, width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gradient Overlay for fade effect */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, #020617, transparent)' }} />
                </div>
            </main>

            {/* Features Grid */}
            <section id="features" style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '100px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.02em' }}>Platform Capabilities</h2>
                    <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                        Everything you need to turn global trade complexity into a competitive advantage.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <FeatureCard
                        icon={Globe} title="Real-Time Trade Monitoring" delay={100}
                        description="Monitor changing tariffs, embargoes, and trade policies across 190+ countries in real-time."
                    />
                    <FeatureCard
                        icon={TrendingUp} title="Landed Cost Optimization" delay={200}
                        description="Instantly calculate true landed costs including taxes, duties, and transport fees to protect margins."
                    />
                    <FeatureCard
                        icon={ShieldCheck} title="Automated Compliance" delay={300}
                        description="Automatically check product HS codes against global sanction lists and import restrictions."
                    />
                    <FeatureCard
                        icon={Cpu} title="Predictive AI Models" delay={400}
                        description="Anticipate future tariff hikes and supply chain bottlenecks before they impact your business."
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ position: 'relative', zIndex: 10, padding: '100px 32px' }}>
                <div style={{
                    maxWidth: 1000, margin: '0 auto', padding: '80px 40px', borderRadius: '32px',
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))',
                    border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center',
                    boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)'
                }}>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-0.02em' }}>Ready to optimize your global trade?</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '20px', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Join top logistics and supply chain teams who trust TariffIQ for their decision intelligence.
                    </p>
                    <Link href="/login" passHref>
                        <button style={{
                            padding: '18px 48px', borderRadius: '14px',
                            background: '#fff', border: 'none',
                            color: '#0f172a', fontSize: '18px', fontWeight: 800, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 12,
                            boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.4)',
                            transition: 'all 0.3s ease',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(255, 255, 255, 0.6)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(255, 255, 255, 0.4)'; }}
                        >
                            Start Optimization Journey <ArrowRight size={20} />
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 32px', textAlign: 'center', color: '#64748b', fontSize: '14px', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={16} /> TariffIQ © 2026. All rights reserved.
                    </div>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Sales</a>
                    </div>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.1); opacity: 0.8; }
                }
            `}} />
        </div>
    );
}
