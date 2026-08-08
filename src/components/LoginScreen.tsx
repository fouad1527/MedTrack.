import React, { useState, useEffect } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { AnatomicalAiHero } from './AnatomicalAiHero';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, register, resetPassword, authError } = useMedTrack();
  
  // View states: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Feedback & Loading
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Parallax Coordinates (-1 to 1)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Page Load Entrance
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e) return;
    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    const innerWidth = window.innerWidth || 1;
    const innerHeight = window.innerHeight || 1;
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    if (mode === 'login') {
      const success = await login(email, password);
      if (!success) {
        setLoading(false);
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please verify.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setLocalError('Password should be at least 6 characters.');
        setLoading(false);
        return;
      }
      const success = await register(fullName, email, password);
      if (!success) {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      const success = await resetPassword(email);
      setLoading(false);
      if (success) {
        setResetSent(true);
      }
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    await login('sarah.chen@medtrack.io', 'medtrack2026');
    setLoading(false);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-full bg-[#0F172A] text-white flex flex-col lg:flex-row font-sans relative overflow-hidden select-none transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* AMBIENT SOFT GLOW BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-sky-500/10 rounded-full blur-[160px] transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${(mousePos?.x ?? 0) * -15}px, ${(mousePos?.y ?? 0) * -15}px, 0)` }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-indigo-500/10 rounded-full blur-[160px] transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${(mousePos?.x ?? 0) * 15}px, ${(mousePos?.y ?? 0) * 15}px, 0)` }}
        />
      </div>

      {/* LEFT SIDE (55% Desktop): SUBTLE ABSTRACT NEURAL ANIMATION & VALUE PROPOSITION */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[58%] relative z-10 border-r border-slate-800/80 bg-[#0F172A]">
        <AnatomicalAiHero mouseX={mousePos?.x ?? 0} mouseY={mousePos?.y ?? 0} />
      </div>

      {/* RIGHT SIDE (45% Desktop): GLASSMORPHISM AUTH CARD */}
      <div className="flex-1 p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-center items-center relative z-10 my-auto min-h-screen">
        <div className="w-full max-w-md space-y-8">
          
          {/* LOGO & BRANDING HEADER */}
          <div className="flex flex-col items-center text-center space-y-3 transition-opacity duration-500">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 to-blue-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300" />
              <img 
                src="/medtrack-logo.svg" 
                alt="MedTrack Logo" 
                className="w-14 h-14 rounded-2xl relative shadow-2xl object-contain bg-[#0F172A] border border-sky-400/20 p-2 transform group-hover:scale-105 transition-transform duration-300" 
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                MedTrack
              </h1>
              <p className="text-xs font-semibold text-sky-400 font-mono tracking-widest uppercase">
                Track Your Med Way
              </p>
            </div>
          </div>

          {/* GLASSMORPHISM CARD CONTAINER */}
          <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-sky-500/20 p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-300 hover:border-sky-500/35">
            {/* Top Cyan Accent Beam */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

            {/* TAB SWITCHER (Sign In / Create Account) */}
            <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setLocalError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setLocalError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* CARD TITLE / SUBTITLE */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Get Started'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
                {mode === 'login' && 'Enter your credentials to access your student workspace.'}
                {mode === 'register' && 'Set up your medical student profile to begin tracking.'}
                {mode === 'forgot' && 'Enter your account email to receive a recovery link.'}
              </p>
            </div>

            {/* FEEDBACK ALERTS */}
            {(authError || localError) && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="font-medium leading-snug">{localError || authError}</span>
              </div>
            )}

            {resetSent && mode === 'forgot' && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="font-medium leading-snug">Password reset link sent to your inbox. Check your email.</span>
              </div>
            )}

            {/* MAIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FULL NAME (Sign Up mode) */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Full Name
                  </label>
                  <div className="relative group">
                    <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Medical Student Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL FIELD */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@medschool.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all font-medium"
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => { setMode('forgot'); setLocalError(null); }}
                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* CONFIRM PASSWORD (Sign Up mode) */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {/* REMEMBER ME CHECKBOX */}
              {mode === 'login' && (
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500/30 accent-sky-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-slate-300 cursor-pointer font-medium">
                    Remember me on this device
                  </label>
                </div>
              )}

              {/* ACTION BUTTON WITH MICRO LIFT ON HOVER */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(56,189,248,0.25)] hover:shadow-[0_6px_25px_rgba(56,189,248,0.4)] flex items-center justify-center gap-2 mt-2 cursor-pointer active:translate-y-0 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Create Account'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* FORGOT PASSWORD BACK LINK */}
            {mode === 'forgot' && (
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLocalError(null); setResetSent(false); }}
                  className="w-full text-xs text-sky-400 hover:text-sky-300 font-medium text-center transition-colors cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            )}
          </div>

          {/* FOOTER DISCLOSURE */}
          <p className="text-[11px] text-slate-500 text-center font-mono">
            Encrypted &bull; HIPAA Compliant Storage &bull; MedTrack 2026
          </p>
        </div>
      </div>
    </div>
  );
};
