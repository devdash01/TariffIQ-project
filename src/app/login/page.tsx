"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            router.push('/dashboard');
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center relative overflow-hidden font-sans">
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[40vw] h-[40vw] bg-primary/15 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-grid-pattern opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]" />
            </div>

            {/* Logo */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-3 z-10 transition-opacity hover:opacity-80">
                <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/logo.png" alt="TariffIQ Logo" className="w-full h-full object-contain" />
                </div>
                <div className="font-extrabold text-xl tracking-tight text-white">TariffIQ</div>
            </Link>

            {/* Login Card */}
            <div className="w-full max-w-[440px] p-10 md:p-12 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-3xl shadow-2xl z-10 animate-fade-in-up">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Welcome back</h1>
                    <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="email"
                            placeholder="Email address"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>

                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 transition-colors">
                            <input type="checkbox" className="accent-primary w-4 h-4 rounded border-white/10 bg-white/5" />
                            Remember me
                        </label>
                        <a href="#" className="text-primary font-bold hover:underline">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Authenticating...
                            </div>
                        ) : (
                            <>Sign In <LogIn size={18} /></>
                        )}
                    </button>

                    {/* Demo Warning */}
                    <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-300 text-[12px] leading-relaxed text-center italic">
                        <span className="font-bold uppercase tracking-wider text-[10px] mr-1">Beta Preview:</span> 
                        Enter any email/password. You&apos;ll be logged in automatically for the hackathon demo.
                    </div>
                </form>

                <div className="mt-10 text-center text-sm text-slate-500">
                    Don&apos;t have an account? <a href="#" className="text-primary font-bold hover:underline">Request Access</a>
                </div>
            </div>
        </div>
    );
}
