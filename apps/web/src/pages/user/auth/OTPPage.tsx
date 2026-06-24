import { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export const OTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(60);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const { verifyOTP, sendOTP, isLoading } = useAuth();

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const setDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const copy = [...digits];
    copy[index] = value.slice(-1);
    setDigits(copy);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const value = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (value.length === 6) {
      event.preventDefault();
      setDigits(value.split(''));
      inputs.current[5]?.focus();
    }
  };

  const submit = async () => {
    try {
      await verifyOTP({ email, code: digits.join('') });
      navigate('/home', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP ভুল হয়েছে');
    }
  };

  const resend = async () => {
    try {
      await sendOTP(email);
      setSeconds(60);
      toast.success('OTP আবার পাঠানো হয়েছে');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP পাঠানো যায়নি');
    }
  };

  return (
    <main className="min-h-screen bg-surface px-6 pt-12">
      <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-bg"><ChevronLeft className="h-5 w-5" /></button>
      <section className="mt-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-3xl">✉️</div>
        <h1 className="mt-5 font-bengali text-2xl font-bold">যাচাইকরণ</h1>
        <p className="mt-2 font-bengali text-sm text-text-secondary">আপনার ইমেইলে ৬ ডিজিট কোড পাঠানো হয়েছে</p>
        <p className="mt-1 text-sm font-bold text-primary">{email || 'ইমেইল পাওয়া যায়নি'}</p>
        <div className="mt-8 grid grid-cols-6 gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => (inputs.current[index] = node)}
              value={digit}
              onPaste={paste}
              onKeyDown={(event) => keyDown(event, index)}
              onChange={(event) => setDigit(index, event.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="h-12 rounded-app border border-border bg-bg text-center text-xl font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          ))}
        </div>
        <button disabled={isLoading || digits.some((digit) => !digit)} onClick={submit} className="mt-8 w-full rounded-app bg-primary py-4 font-bengali font-bold text-white disabled:opacity-50">যাচাই করুন</button>
        <button disabled={seconds > 0} onClick={resend} className="mt-4 font-bengali text-sm font-semibold text-primary disabled:text-text-muted">
          {seconds > 0 ? `${seconds}s পরে আবার পাঠান` : 'আবার OTP পাঠান'}
        </button>
      </section>
    </main>
  );
};

