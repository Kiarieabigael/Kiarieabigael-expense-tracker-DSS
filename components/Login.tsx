
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Mail, 
  Lock, 
  LogIn, 
  ChevronRight, 
  Fingerprint, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { 
  hashPassword, 
  validatePasswordStrength, 
  isEmailRegistered, 
  isPasswordHashUnique,
  registerUserLocally,
  verifyCredentials 
} from '../utils/auth';

interface LoginProps {
  onLogin: (user: { id: string; email: string }, provider: 'local') => void;
}

type AuthView = 'LOGIN' | 'SIGNUP' | 'FORGOT' | 'RESET_SENT';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Strength calculations
  const strength = useMemo(() => validatePasswordStrength(password), [password]);
  const isEmailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  useEffect(() => {
    setError(null);
    setShake(false);
  }, [view, email, password]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await verifyCredentials(email, password);
      if (user) {
        onLogin({ id: user.id, email: user.email }, 'local');
      } else {
        setError("We couldn’t sign you in. Please check your details.");
        triggerShake();
      }
    } catch (e) {
      setError("An error occurred during sign-in.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      triggerShake();
      setLoading(false);
      return;
    }

    if (isEmailRegistered(email)) {
      setError("This email is already registered. Please log in.");
      triggerShake();
      setLoading(false);
      return;
    }

    if (!strength.isValid) {
      setError("Please choose a stronger password.");
      triggerShake();
      setLoading(false);
      return;
    }

    try {
      const saltHash = await hashPassword(password);
      const userId = registerUserLocally(email, saltHash);
      onLogin({ id: userId, email }, 'local');
    } catch (e) {
      setError("Account initialization failed.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      triggerShake();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('RESET_SENT');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 auth-bg overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

      <div className={`relative z-10 w-full max-w-[480px] glass-card rounded-[40px] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 ${shake ? 'shake' : ''} animate-in fade-in zoom-in duration-1000`}>
        
        {/* Navigation back */}
        {view !== 'LOGIN' && view !== 'RESET_SENT' && (
          <button 
            onClick={() => setView('LOGIN')}
            className="absolute top-10 left-10 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl text-indigo-600 shadow-2xl shadow-indigo-100/50 mb-6 border border-slate-50">
            <Shield size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {view === 'LOGIN' && 'Welcome to Settle'}
            {view === 'SIGNUP' && 'Create Your Vault'}
            {view === 'FORGOT' && 'Recover Account'}
            {view === 'RESET_SENT' && 'Check Your Email'}
          </h1>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed font-medium">
            {view === 'LOGIN' && 'Your private, localized financial gateway.'}
            {view === 'SIGNUP' && 'Protect your earnings with local-first encryption.'}
            {view === 'FORGOT' && 'Enter your email to receive a recovery link.'}
            {view === 'RESET_SENT' && 'Instructions have been sent to your inbox.'}
          </p>
        </div>

        {view === 'RESET_SENT' ? (
          <div className="text-center space-y-8 py-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              If <span className="font-bold text-slate-900">{email}</span> exists in our vault, a password reset link has been sent. It expires in 15 minutes.
            </p>
            <button 
              onClick={() => setView('LOGIN')}
              className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] ripple-btn"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={view === 'LOGIN' ? handleLogin : view === 'SIGNUP' ? handleSignup : handleForgot} className="space-y-5">
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between items-center">
                  <span>Email Address</span>
                  {isEmailValid && <CheckCircle2 size={12} className="text-emerald-500" />}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-14 pr-4 py-5 bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none rounded-[22px] transition-all text-sm font-medium input-focus-ring"
                    required
                  />
                </div>
              </div>

              {view !== 'FORGOT' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-14 pr-14 py-5 bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none rounded-[22px] transition-all text-sm font-medium input-focus-ring"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {password && view === 'SIGNUP' && (
                    <div className="px-1 pt-1">
                      <div className="flex gap-1.5 h-1.5 mb-2">
                        {[0, 1, 2, 3].map((step) => (
                          <div 
                            key={step} 
                            className={`flex-1 rounded-full transition-all duration-500 ${
                              strength.score > step 
                                ? strength.score === 4 ? 'bg-emerald-500' : 'bg-indigo-400'
                                : 'bg-slate-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${
                          strength.isValid ? 'text-emerald-500' : 'text-slate-400'
                        }`}>
                          {strength.isValid ? 'Secure Password' : 'Choose a Stronger Password'}
                        </p>
                        {strength.isValid && <Sparkles size={12} className="text-emerald-500 animate-pulse" />}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {view === 'SIGNUP' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Identity</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat Password"
                      className="w-full pl-14 pr-4 py-5 bg-slate-50/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none rounded-[22px] transition-all text-sm font-medium input-focus-ring"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-indigo-100 ripple-btn mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{view === 'LOGIN' ? 'Enter Vault' : view === 'SIGNUP' ? 'Initialize Account' : 'Request Link'}</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-col items-center gap-6 pt-4">
              {view === 'LOGIN' ? (
                <>
                  <button onClick={() => setView('FORGOT')} className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors tracking-wide underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600">Forgot your password?</button>
                  <p className="text-xs text-slate-500 font-medium">
                    New to Settle? <button onClick={() => setView('SIGNUP')} className="text-indigo-600 font-black hover:underline underline-offset-4 ml-1">Create your account</button>
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  Already have a key? <button onClick={() => setView('LOGIN')} className="text-indigo-600 font-black hover:underline underline-offset-4 ml-1">Sign in instead</button>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100/50 text-center">
          <div className="inline-flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
            <Fingerprint size={16} className="text-indigo-200" /> PBKDF2 (100k) & HMAC Integrity
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
