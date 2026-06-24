import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const emailSchema = z.object({ email: z.string().email('সঠিক ইমেইল দিন'), password: z.string().min(1, 'পাসওয়ার্ড দিন') });

type Tab = 'email' | 'otp';

export const LoginPage = () => {
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleRef = useRef<HTMLDivElement | null>(null);
  const { loginEmail, sendOTP, loginGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const isNative = Capacitor.isNativePlatform();

  // Native Google Sign-In init (Android/iOS)
  useEffect(() => {
    if (!isNative || !googleClientId) return;
    GoogleAuth.initialize({
      clientId: googleClientId,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }, [isNative, googleClientId]);

  // Web Google Sign-In SDK init
  useEffect(() => {
    if (isNative || !googleClientId) return;
    const init = () => {
      if (window.google?.accounts?.id) { setGoogleReady(true); return; }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true;
      s.onload = () => setGoogleReady(true);
      document.head.appendChild(s);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }, [isNative, googleClientId]);

  useEffect(() => {
    if (isNative || !googleReady || !googleClientId || !googleRef.current || !window.google?.accounts?.id) return;
    googleRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (res) => {
        if (!res.credential) return toast.error('Google credential পাওয়া যায়নি');
        try {
          await loginGoogle(res.credential);
          navigate('/home', { replace: true });
        } catch (e) { toast.error(e instanceof Error ? e.message : 'Google login failed'); }
      }
    });
    window.google.accounts.id.renderButton(googleRef.current, {
      type: 'standard', theme: 'outline', size: 'large',
      text: 'continue_with', shape: 'pill', width: googleRef.current.offsetWidth || 300
    });
  }, [isNative, googleReady, googleClientId, loginGoogle, navigate]);

  const handleNativeGoogle = async () => {
    try {
      const user = await GoogleAuth.signIn();
      const idToken = user.authentication.idToken;
      if (!idToken) return toast.error('Google token পাওয়া যায়নি');
      await loginGoogle(idToken);
      navigate('/home', { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('cancel') || msg.includes('cancelled') || msg.includes('12501')) return;
      toast.error(e instanceof Error ? e.message : 'Google login ব্যর্থ হয়েছে');
    }
  };

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    const p = emailSchema.safeParse({ email, password });
    if (!p.success) return toast.error(p.error.issues[0].message);
    try {
      await loginEmail(p.data);
      navigate('/home', { replace: true });
    } catch (e) { toast.error(e instanceof Error ? e.message : 'লগইন ব্যর্থ হয়েছে'); }
  };

  const submitOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!z.string().email().safeParse(otpEmail).success) return toast.error('সঠিক ইমেইল দিন');
    try {
      const res = await sendOTP(otpEmail);
      navigate('/otp', { state: { email: otpEmail, devCode: res.devCode } });
    } catch (e) { toast.error(e instanceof Error ? e.message : 'OTP পাঠানো যায়নি'); }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0B1437]">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1437] via-[#1B4FDB]/30 to-[#0B1437]" />
        {/* Road lines */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-full opacity-10">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="mx-auto mb-6 h-10 w-2 rounded-full bg-white" style={{ marginTop: i === 0 ? '40%' : 0 }} />
          ))}
        </div>
        {/* Glowing circles */}
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute -right-20 bottom-40 h-64 w-64 rounded-full bg-secondary/20 blur-[80px]" />
      </div>

      {/* Logo / Hero */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-lg shadow-primary/40 mb-4">
          <span className="text-3xl">🌉</span>
        </div>
        <h1 className="text-2xl font-bold text-white">TollBD</h1>
        <p className="font-bengali mt-1 text-sm text-white/50">স্মার্ট টোল পেমেন্ট</p>
      </div>

      {/* Card */}
      <div className="relative z-10 mx-4 flex-1 rounded-t-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 px-6 pt-6 pb-8 shadow-2xl">
        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/10 p-1">
          {([['email', <Mail key="m" className="h-3.5 w-3.5" />, 'ইমেইল & পাসওয়ার্ড'], ['otp', <Smartphone key="s" className="h-3.5 w-3.5" />, 'OTP লগইন']] as [Tab, React.ReactNode, string][]).map(([t, icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bengali text-xs font-bold transition-all ${tab === t ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-white/50 hover:text-white/80'}`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* Email login form */}
        {tab === 'email' && (
          <form onSubmit={submitEmail} className="space-y-4">
            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">ইমেইল ঠিকানা</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 focus-within:border-primary/60 focus-within:bg-white/15 transition">
                <Mail className="h-4 w-4 shrink-0 text-white/40" />
                <input
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  type="email" placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">পাসওয়ার্ড</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 focus-within:border-primary/60 transition">
                <Lock className="h-4 w-4 shrink-0 text-white/40" />
                <input
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/40 disabled:opacity-60 active:scale-[0.98] transition"
            >
              {isLoading ? <span className="animate-spin">⟳</span> : null}
              লগ ইন করুন <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* OTP login form */}
        {tab === 'otp' && (
          <form onSubmit={submitOTP} className="space-y-4">
            <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
              <p className="font-bengali text-xs text-blue-300">আপনার ইমেইলে একটি ৬ ডিজিটের কোড পাঠানো হবে। পাসওয়ার্ড ছাড়াই লগইন করুন।</p>
            </div>
            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">ইমেইল ঠিকানা</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 focus-within:border-primary/60 transition">
                <Mail className="h-4 w-4 shrink-0 text-white/40" />
                <input
                  value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                  type="email" placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
              </div>
            </div>
            <button
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/40 disabled:opacity-60 active:scale-[0.98] transition"
            >
              {isLoading ? <span className="animate-spin">⟳</span> : null}
              OTP পাঠান <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-bengali text-xs text-white/30">অথবা</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Google Sign-In */}
        {isNative ? (
          <button
            onClick={handleNativeGoogle}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-3.5 text-sm font-bold text-white hover:bg-white/15 active:scale-[0.98] transition disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google দিয়ে লগ ইন করুন
          </button>
        ) : (
          <>
            <div ref={googleRef} className="w-full overflow-hidden rounded-2xl" />
            {(!googleReady || !googleClientId) && (
              <button
                onClick={() => {
                  if (!googleClientId) return toast.error('Google Client ID সেট করুন (.env এ)');
                  window.google?.accounts?.id?.prompt();
                }}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 py-3.5 text-sm font-bold text-white hover:bg-white/15 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google দিয়ে লগ ইন করুন
              </button>
            )}
          </>
        )}

        {/* Register link */}
        <p className="mt-5 text-center font-bengali text-sm text-white/40">
          নতুন ব্যবহারকারী?{' '}
          <button onClick={() => navigate('/register')} className="font-bold text-primary hover:underline">
            নিবন্ধন করুন
          </button>
        </p>
      </div>
    </main>
  );
};
