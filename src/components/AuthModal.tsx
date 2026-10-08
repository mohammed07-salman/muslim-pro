import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register({ name, email, password, city, country });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setSuccessMsg(data.message);
        if (data.resetCode) {
          setGeneratedResetCode(data.resetCode);
          setResetCode(data.resetCode);
        }
      } else {
        setError(data.error || 'Failed to request reset');
      }
    } catch {
      setLoading(false);
      setError('Network error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetCode, newPassword })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setSuccessMsg('Password reset successfully! Please login with your new password.');
        setTimeout(() => {
          setAuthModalMode('login');
          setPassword(newPassword);
        }, 1500);
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch {
      setLoading(false);
      setError('Network error');
    }
  };

  // Quick fill test credentials for fast testing
  const fillAdminCredentials = () => {
    setEmail('admin@muslimpro.app');
    setPassword('Admin@123456');
    setError(null);
  };

  const fillUserCredentials = () => {
    setEmail('user@muslimpro.app');
    setPassword('User@123456');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white relative">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif tracking-tight">Muslim Pro</h3>
              <p className="text-xs text-emerald-200">
                {authModalMode === 'login' && 'Sign in to access bookmarks, prayer settings & history'}
                {authModalMode === 'register' && 'Create your free account to sync your Islamic journey'}
                {authModalMode === 'forgot' && 'Reset your password'}
              </p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-2 mt-5 p-1 bg-emerald-950/40 rounded-xl text-xs">
            <button
              onClick={() => { setAuthModalMode('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                authModalMode === 'login' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('register'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                authModalMode === 'register' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => { setAuthModalMode('forgot'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-1.5 font-medium rounded-lg transition-all ${
                authModalMode === 'forgot' ? 'bg-white text-emerald-950 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('forgot')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Demo 1-click accounts */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">
                  Quick 1-Click Demo Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Admin Account
                  </button>
                  <button
                    type="button"
                    onClick={fillUserCredentials}
                    className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Demo User
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Bilal Ibrahim"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. London"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    placeholder="e.g. UK"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authModalMode === 'forgot' && (
            <div className="space-y-4">
              {!generatedResetCode ? (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enter your registered email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    {loading ? 'Generating Code...' : 'Send Reset Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">Your verification reset code is:</p>
                    <p className="text-base font-mono font-bold text-amber-900 dark:text-amber-200 mt-1">{generatedResetCode}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reset Code</label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={e => setResetCode(e.target.value)}
                        placeholder="Enter code"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
