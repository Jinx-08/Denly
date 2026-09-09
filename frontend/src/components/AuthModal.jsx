import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Lock, Mail, Building2, Heart, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('adopter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl p-6 sm:p-8 my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-brand-surface text-brand-dark flex items-center justify-center hover:bg-brand-border transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-sun-primary text-brand-dark flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a3 3 0 0 0-3 3c0 .35.06.68.17.99A3.001 3.001 0 0 0 6 9a3 3 0 0 0 3 3c.35 0 .68-.06.99-.17A4.996 4.996 0 0 0 12 14c.73 0 1.42-.16 2.01-.44.31.27.72.44 1.17.44a3 3 0 0 0 3-3 3.001 3.001 0 0 0-3.17-3.01A3.001 3.001 0 0 0 15 5a3 3 0 0 0-3-3zm-4 13c-2.21 0-4 1.79-4 4a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3c0-2.21-1.79-4-4-4H8z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-black text-brand-dark font-display">
            {isRegister ? 'Join the Denly Family' : 'Welcome Back'}
          </h3>
          <p className="text-xs font-semibold text-brand-muted mt-1">
            {isRegister 
              ? 'Create your account to apply for adoptions or manage shelter listings' 
              : 'Log in to track your adoption applications and clinic visits'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-brand-surface border border-brand-border mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
              !isRegister ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted hover:text-brand-dark'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
              isRegister ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted hover:text-brand-dark'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector on Register */}
          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('adopter')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    role === 'adopter' 
                      ? 'bg-amber-50 border-amber-400 text-brand-dark shadow-sm' 
                      : 'bg-brand-surface border-brand-border text-brand-muted hover:bg-zinc-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${role === 'adopter' ? 'text-amber-600 fill-amber-600' : 'text-brand-muted'}`} />
                  <div>
                    <span className="block text-xs font-bold">Adopter</span>
                    <span className="text-[10px] text-brand-muted">Adopting a pet</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('partner')}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    role === 'partner' 
                      ? 'bg-indigo-50 border-indigo-400 text-brand-dark shadow-sm' 
                      : 'bg-brand-surface border-brand-border text-brand-muted hover:bg-zinc-100'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${role === 'partner' ? 'text-indigo-600' : 'text-brand-muted'}`} />
                  <div>
                    <span className="block text-xs font-bold">Shelter / Vet</span>
                    <span className="text-[10px] text-brand-muted">Managing listings</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  required
                  placeholder="Taylor Swift"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
              Password * (minimum 6 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-brand-dark text-white font-extrabold text-sm uppercase tracking-wider hover:bg-brand-deep transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Please wait...</span>
            ) : (
              <span>{isRegister ? 'Create Account' : 'Sign In to Denly'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
