import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Lock, Mail, User as UserIcon, Sparkles, ArrowRight } from 'lucide-react';
import { useEcommerce } from '../../context/EcommerceContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, switchDemoRole } = useEcommerce();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, role, name || (tab === 'signup' ? name : undefined));
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAuthModalOpen(false);
      }}
    >
      <div
        id="auth-modal-card"
        className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-stone-100 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative corner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-100 p-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black text-xl mb-3 shadow-md">
            A
          </div>
          <h3 className="text-xl font-bold font-serif text-stone-100">
            {tab === 'signin' ? 'Welcome Back to AURA' : 'Create Your Atelier Account'}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Access curated drops, personalized orders, and inventory controls.
          </p>
        </div>

        {/* Quick Demo 1-Click Login Section */}
        <div className="bg-stone-950/90 border border-stone-800 rounded-xl p-3.5 mb-6">
          <p className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Instant Demo Profiles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              id="demo-login-customer-btn"
              type="button"
              onClick={() => {
                switchDemoRole('customer');
                setIsAuthModalOpen(false);
              }}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 hover:border-stone-500 text-stone-200 p-2 rounded-lg text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 group-hover:scale-105 shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-stone-100 truncate">Alex Mercer</div>
                <div className="text-[10px] text-stone-400">Customer Persona</div>
              </div>
            </button>

            <button
              id="demo-login-admin-btn"
              type="button"
              onClick={() => {
                switchDemoRole('admin');
                setIsAuthModalOpen(false);
              }}
              className="flex items-center gap-2 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-500/40 hover:border-amber-400 text-stone-200 p-2 rounded-lg text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center group-hover:scale-105 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-amber-300 truncate">Sarah Chen</div>
                <div className="text-[10px] text-amber-400/80">Inventory Admin</div>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-stone-800 w-full" />
          <span className="bg-stone-900 px-3 text-[11px] text-stone-500 uppercase tracking-wider absolute">
            Or continue with email
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-stone-950 p-1 rounded-lg mb-5 border border-stone-800">
          <button
            id="tab-signin"
            type="button"
            onClick={() => setTab('signin')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === 'signin'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              tab === 'signup'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Thorne"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2.5 pl-9 pr-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <UserIcon className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2.5 pl-9 pr-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-stone-300">Password</label>
              {tab === 'signin' && (
                <button
                  type="button"
                  onClick={() => alert('Demo environment: any password is valid or use 1-click profiles.')}
                  className="text-[11px] text-amber-400/80 hover:text-amber-300"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-2.5 pl-9 pr-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Account Role Selector for Custom Accounts */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">Account Privilege</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                role === 'customer'
                  ? 'bg-stone-800 border-amber-400 text-stone-100'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="radio"
                  name="user-role"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="sr-only"
                />
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Customer</span>
              </label>

              <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                role === 'admin'
                  ? 'bg-stone-800 border-amber-400 text-stone-100'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
              }`}>
                <input
                  type="radio"
                  name="user-role"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="sr-only"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Administrator</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md mt-2"
          >
            <span>{tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
