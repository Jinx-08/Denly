import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, Mail, Building2, Heart, AlertCircle, Sparkles, ArrowLeft, PawPrint } from 'lucide-react';

export const AuthPage = ({ defaultRegister = false }) => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(defaultRegister);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('adopter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsRegister(defaultRegister);
  }, [defaultRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Full Name is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sun-primary/20 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        
        {/* Back to Home link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-muted hover:text-brand-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-brand-dark text-sun-primary flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <PawPrint className="w-4 h-4 fill-sun-primary" />
            </div>
            <span className="text-xl font-black font-display tracking-tight text-brand-dark">DENLY</span>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-brand-dark font-display">
            {isRegister ? 'Create Your Account' : 'Welcome Back to Denly'}
          </h2>
          <p className="mt-1 text-xs text-brand-muted font-medium">
            {isRegister 
              ? 'Access your adopter or partner shelter portal' 
              : 'Sign in to access your personal dashboard'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-4xl border border-brand-border text-left">
          
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
              Register
            </button>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role selection on Register */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                  Account Type:
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
                      <span className="text-[10px] text-brand-muted">Adopting pets</span>
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
                      <span className="text-[10px] text-brand-muted">Manage pets</span>
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
                    placeholder="Priya Sharma"
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
                  placeholder="priya@example.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium focus:ring-2 focus:ring-brand-dark outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-1">
                Password * (min 6 characters)
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
                <span>Signing in...</span>
              ) : (
                <span>{isRegister ? 'Register & Enter Dashboard' : 'Sign In to Dashboard'}</span>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
