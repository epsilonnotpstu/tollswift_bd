import { FormEvent, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

const emailSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const otpEmailSchema = z.string().email();

export const LoginPage = () => {
  const [tab, setTab] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const { loginEmail, sendOTP, loginGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId) return;

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const loadGoogle = () => setGoogleReady(true);

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', loadGoogle, { once: true });
      return () => existingScript.removeEventListener('load', loadGoogle);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = loadGoogle;
    script.onerror = () => toast.error('Google Sign-In load করা যায়নি');
    document.head.appendChild(script);
  }, [googleClientId]);

  useEffect(() => {
    if (!googleReady || !googleClientId || !googleButtonRef.current || !window.google?.accounts?.id) return;

    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        if (!response.credential) {
          toast.error('Google credential পাওয়া যায়নি');
          return;
        }

        try {
          await loginGoogle(response.credential);
          navigate('/home', { replace: true });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Google login failed');
        }
      },
      cancel_on_tap_outside: true
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: googleButtonRef.current.offsetWidth || 320
    });
  }, [googleReady, googleClientId, loginGoogle, navigate]);

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error('সঠিক ইমেইল ও পাসওয়ার্ড দিন');
      return;
    }
    try {
      await loginEmail(parsed.data);
      navigate('/home', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const submitOTP = async () => {
    const parsed = otpEmailSchema.safeParse(otpEmail);
    if (!parsed.success) {
      toast.error('OTP পাঠাতে ইমেইল দিন');
      return;
    }
    try {
      await sendOTP(parsed.data);
      navigate('/otp', { state: { email: parsed.data } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP failed');
    }
  };

  const promptGoogle = () => {
    if (!googleClientId) {
      toast.error('apps/web/.env এ VITE_GOOGLE_CLIENT_ID সেট করুন');
      return;
    }

    if (!window.google?.accounts?.id) {
      toast.error('Google Sign-In এখনও লোড হয়নি');
      return;
    }

    window.google.accounts.id.prompt();
  };

  return (
    <main className="min-h-screen bg-surface">
      <section className="rounded-b-[40px] bg-primary px-6 pb-14 pt-14 text-center text-white">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-app bg-white/15 text-3xl">🌉</div>
        <h1 className="font-bengali text-2xl font-bold">আবার স্বাগতম</h1>
        <p className="text-sm text-white/75">Sign in to continue</p>
      </section>
      <section className="px-6 py-6">
        <div className="mb-6 grid grid-cols-2 rounded-app bg-bg p-1">
          <button onClick={() => setTab('phone')} className={`rounded-app py-3 font-bengali text-sm font-bold ${tab === 'phone' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'}`}>OTP</button>
          <button onClick={() => setTab('email')} className={`rounded-app py-3 font-bengali text-sm font-bold ${tab === 'email' ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'}`}>ইমেইল</button>
        </div>
        {tab === 'phone' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-bengali text-xs font-semibold text-text-secondary">ইমেইল OTP</span>
              <div className="flex items-center gap-2 rounded-app border border-border bg-bg px-4 py-3">
                <Phone className="h-5 w-5 text-text-muted" />
                <input value={otpEmail} onChange={(event) => setOtpEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              </div>
            </label>
            <button disabled={isLoading} onClick={submitOTP} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white">OTP পাঠান</button>
          </div>
        ) : (
          <form onSubmit={submitEmail} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block font-bengali text-xs font-semibold text-text-secondary">ইমেইল</span>
              <div className="flex items-center gap-2 rounded-app border border-border bg-bg px-4 py-3">
                <Mail className="h-5 w-5 text-text-muted" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-xs font-semibold text-text-secondary">পাসওয়ার্ড</span>
              <div className="flex items-center gap-2 rounded-app border border-border bg-bg px-4 py-3">
                <Lock className="h-5 w-5 text-text-muted" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="h-5 w-5 text-text-muted" /> : <Eye className="h-5 w-5 text-text-muted" />}</button>
              </div>
            </label>
            <button disabled={isLoading} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white">লগ ইন করুন</button>
          </form>
        )}
        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-bengali text-xs text-text-muted">অথবা</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="min-h-[44px] w-full" ref={googleButtonRef} />
        {!googleClientId || !googleReady ? (
          <button onClick={promptGoogle} className="mt-2 w-full rounded-app border border-border bg-surface py-3.5 font-semibold text-text-primary">
            Google দিয়ে লগ ইন করুন
          </button>
        ) : null}
        <button onClick={() => navigate('/register')} className="mt-5 w-full font-bengali text-sm text-text-secondary">নতুন ব্যবহারকারী? <span className="font-bold text-primary">নিবন্ধন করুন</span></button>
      </section>
    </main>
  );
};
