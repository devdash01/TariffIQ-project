"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate a network request, then redirect to Dashboard
        setTimeout(() => {
            router.push('/dashboard');
        }, 1200);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff', fontSize: '15px', fontWeight: 500, outline: 'none',
        transition: 'all 0.2s', fontFamily: 'inherit'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020617', // Match Landing Page BG
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            position: 'relative', overflow: 'hidden'
        }}>
            {/* Dynamic Background Effects */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '10%', width: '40vw', height: '40vw',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(2,6,23,0) 70%)',
                    borderRadius: '50%', filter: 'blur(80px)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '10%', width: '50vw', height: '50vw',
                    background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(2,6,23,0) 70%)',
                    borderRadius: '50%', filter: 'blur(100px)'
                }} />
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.8,
                    maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
                }} />
            </div>

            {/* Logo heading back to home */}
            <Link href="/" style={{ position: 'absolute', top: 32, left: 32, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, zIndex: 10 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <Activity size={18} color="#fff" strokeWidth={2.5} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: '-0.02em' }}>TariffIQ</div>
            </Link>

            {/* Login Card */}
            <div className="animate-fade-in-up" style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '440px',
                padding: '48px 40px', borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>Welcome back</h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} color="#64748b" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#64748b" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#cbd5e1' }}>
                            <input type="checkbox" style={{ accentColor: '#3b82f6', width: 14, height: 14 }} />
                            Remember me
                        </label>
                        <a href="#" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '12px', padding: '14px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2563eb, #6366f1)', border: 'none',
                            color: '#fff', fontSize: '16px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 8px 20px -8px rgba(37, 99, 235, 0.6)',
                            transition: 'all 0.2s ease', opacity: isLoading ? 0.8 : 1
                        }}
                    >
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="animate-spin-slow" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                                Authenticating...
                            </span>
                        ) : (
                            <>Sign In <LogIn size={18} /></>
                        )}
                    </button>

                    {/* Demo Warning / Note */}
                    <div style={{
                        marginTop: 16, padding: '12px', borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd', fontSize: '12px', textAlign: 'center', lineHeight: 1.5
                    }}>
                        <strong>Beta Preview:</strong> Enter any email/password. You'll be logged in automatically for the hackathon demo.
                    </div>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
                    Don't have an account? <a href="#" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Request Access</a>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .animate-spin-slow {
                    animation: spin 1.5s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
