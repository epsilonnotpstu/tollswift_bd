import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { CheckCircle, ChevronLeft, Mail, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export const OTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; devCode?: string } | null;
  const email = state?.email ?? '';
  const devCode = state?.devCode;
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(true); // came from login → already sent
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const { verifyOTP, sendOTP, isLoading } = useAuth();

  useEffect(() => {
    if (emailSent) setTimeout(() => inputs.current[0]?.focus(), 300);
  }, [emailSent]);

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-submit when all 6 filled
  useEffect(() => {
    if (digits.every((d) => d) && !submitting) {
      submit(digits.join(''));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const setDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...digits];
    next[i] = v.slice(-1);
    setDigits(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const keyDown = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Backspace') {
      if (digits[i]) { const n = [...digits]; n[i] = ''; setDigits(n); }
      else if (i > 0) inputs.current[i - 1]?.focus();
    }
  };

  const paste = (e: ClipboardEvent<HTMLInputElement>) => {
    const v = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (v.length === 6) { e.preventDefault(); setDigits(v.split('')); inputs.current[5]?.focus(); }
  };

  const submit = async (code: string) => {
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    try {
      await verifyOTP({ email, code });
      navigate('/home', { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'OTP ভুল হয়েছে');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    } finally { setSubmitting(false); }
  };

  const resend = async () => {
    if (seconds > 0 || !email || isLoading) return;
    try {
      await sendOTP(email);
      setSeconds(60);
      setEmailSent(true);
      toast.success('নতুন OTP পাঠানো হয়েছে');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'OTP পাঠানো যায়নি'); }
  };

  const filled = digits.filter(Boolean).length;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0B1437]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1437] via-[#1B4FDB]/20 to-[#0B1437]" />
        <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-primary/15 blur-[80px]" />
        <div className="absolute right-1/4 bottom-1/3 h-48 w-48 rounded-full bg-secondary/15 blur-[80px]" />
      </div>

      {/* Back button */}
      <div className="relative z-10 px-5 pt-12">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12">

        {/* Dev mode OTP banner */}
        {devCode && (
          <div className="mb-4 w-full max-w-xs rounded-2xl border-2 border-amber-400/50 bg-amber-500/15 px-4 py-3">
            <p className="font-bengali text-xs font-bold text-amber-300 mb-1">🛠 Development Mode — Email domain unverified</p>
            <div className="flex items-center justify-between">
              <span className="font-bengali text-xs text-amber-400/80">তোমার OTP কোড:</span>
              <button
                onClick={() => { setDigits(devCode.split('')); }}
                className="font-mono text-xl font-bold tracking-[0.3em] text-amber-300 hover:text-amber-200 transition"
              >
                {devCode}
              </button>
            </div>
            <p className="font-bengali text-[10px] text-amber-400/50 mt-1">উপরের কোডে ক্লিক করলে auto-fill হবে</p>
          </div>
        )}

        {/* Email sent confirmation banner */}
        {emailSent && !devCode && (
          <div className="mb-6 w-full max-w-xs rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-3 flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            <div>
              <p className="font-bengali text-sm font-bold text-green-300">ইমেইল পাঠানো হয়েছে ✓</p>
              <p className="font-bengali text-xs text-green-400/80 mt-0.5 break-all">{email}</p>
              <p className="font-bengali text-xs text-white/40 mt-1">Spam / Junk ফোল্ডারও চেক করুন</p>
            </div>
          </div>
        )}

        {/* Icon */}
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 border border-primary/30 shadow-xl shadow-primary/20">
          <Mail className="h-9 w-9 text-primary" />
        </div>

        <h1 className="font-bengali text-2xl font-bold text-white">OTP যাচাইকরণ</h1>
        <p className="font-bengali mt-2 text-center text-sm text-white/50 max-w-xs">
          <span className="break-all font-semibold text-primary">{email || 'আপনার ইমেইলে'}</span>
          {' '}পাঠানো ৬ ডিজিটের কোড দিন
        </p>

        {/* Progress */}
        <div className="mt-6 w-full max-w-xs">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(filled / 6) * 100}%` }} />
          </div>
        </div>

        {/* Digit boxes */}
        <div className="mt-4 grid grid-cols-6 gap-2 w-full max-w-xs">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(n) => (inputs.current[i] = n)}
              value={d}
              onPaste={paste}
              onKeyDown={(e) => keyDown(e, i)}
              onChange={(e) => setDigit(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              disabled={submitting || isLoading}
              className={`h-14 rounded-2xl border text-center text-xl font-bold outline-none transition-all disabled:opacity-50
                ${d
                  ? 'border-primary/60 bg-primary/20 text-white shadow-lg shadow-primary/20'
                  : 'border-white/15 bg-white/10 text-white'}
                focus:border-primary focus:bg-primary/20 focus:shadow-lg focus:shadow-primary/20`}
            />
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={() => submit(digits.join(''))}
          disabled={digits.some((d) => !d) || submitting || isLoading}
          className="mt-6 flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/40 disabled:opacity-40 active:scale-[0.98] transition"
        >
          {(submitting || isLoading)
            ? <><RefreshCw className="h-4 w-4 animate-spin" /> যাচাই হচ্ছে...</>
            : 'যাচাই করুন'}
        </button>

        {/* Resend */}
        <div className="mt-5 text-center">
          {seconds > 0
            ? <p className="font-bengali text-sm text-white/40"><span className="font-semibold text-white/60">{seconds}s</span> পরে আবার পাঠাতে পারবেন</p>
            : <button onClick={resend} disabled={isLoading} className="font-bengali text-sm font-bold text-primary hover:underline disabled:opacity-50">আবার OTP পাঠান</button>}
        </div>
      </div>
    </main>
  );
};
