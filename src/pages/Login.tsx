import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
    const { session, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'magic-link'>('login');
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    React.useEffect(() => {
        if (session && !authLoading) {
            navigate('/admin');
        }
    }, [session, authLoading, navigate]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    setError('Email ou senha incorretos.');
                } else if (error.message.includes('Email not confirmed')) {
                    setError('Confirme seu email antes de fazer login.');
                } else {
                    setError(error.message);
                }
            }
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/admin`
                }
            });

            if (error) {
                setError(error.message);
            } else {
                setMagicLinkSent(true);
            }
        } catch (err) {
            setError('Erro ao enviar o link. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
            {/* Header */}
            <header className="p-6">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao site
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 pb-12">
                <div className="w-full max-w-md">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Área Administrativa</h1>
                        <p className="text-slate-400 text-sm">Acesso restrito para administradores</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">

                        {/* Magic Link Success Message */}
                        {magicLinkSent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mail className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">Verifique seu email!</h2>
                                <p className="text-slate-400 text-sm mb-6">
                                    Enviamos um link de acesso para <strong className="text-white">{email}</strong>
                                </p>
                                <button
                                    onClick={() => setMagicLinkSent(false)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    Usar outro email
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Mode Tabs */}
                                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl mb-6">
                                    <button
                                        onClick={() => setMode('login')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'login'
                                                ? 'bg-white text-slate-900 shadow-lg'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        Email & Senha
                                    </button>
                                    <button
                                        onClick={() => setMode('magic-link')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'magic-link'
                                                ? 'bg-white text-slate-900 shadow-lg'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        Magic Link
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={mode === 'login' ? handleEmailLogin : handleMagicLink} className="space-y-5">
                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="seu@email.com"
                                                required
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field (only for login mode) */}
                                    {mode === 'login' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                {mode === 'login' ? 'Entrando...' : 'Enviando...'}
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-5 h-5" />
                                                {mode === 'login' ? 'Entrar' : 'Enviar Magic Link'}
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Help Text */}
                                <p className="mt-6 text-center text-slate-500 text-xs">
                                    {mode === 'login'
                                        ? 'Use suas credenciais de administrador para acessar.'
                                        : 'Você receberá um link de acesso único no seu email.'
                                    }
                                </p>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-slate-600 text-xs">
                        © 2024 Salário do Servidor. Área restrita.
                    </p>
                </div>
            </main>
        </div>
    );
}
