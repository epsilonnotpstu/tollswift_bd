import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import * as authApi from '@/api/auth.api';

const schema = z.object({
  fullName: z.string().min(2, 'নাম অন্তত ২ অক্ষর হতে হবে'),
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string()
    .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষর')
    .regex(/[A-Z]/, 'একটি বড় হাতের অক্ষর থাকতে হবে')
    .regex(/[0-9]/, 'একটি সংখ্যা থাকতে হবে')
});

const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const STEPS = ['তথ্য', 'বিবরণ'];

export const RegisterPage = () => {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [division, setDivision] = useState('Dhaka');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const goNext = (e: FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse({ fullName, email, password });
    if (!p.success) return toast.error(p.error.issues[0].message);
    if (password !== confirmPass) return toast.error('পাসওয়ার্ড মিলছে না');
    setStep(1);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register({ fullName: fullName.trim(), email: email.toLowerCase(), password });
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে — OTP যাচাই করুন');
      navigate('/otp', { state: { email, devCode: (res as typeof res & { devCode?: string }).devCode } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'নিবন্ধন ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthColor = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-green-400'][strength - 1] ?? 'bg-white/10';

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0B1437]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1437] via-[#1B4FDB]/25 to-[#0B1437]" />
        <div className="absolute -left-16 top-32 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute -right-16 bottom-32 h-56 w-56 rounded-full bg-secondary/15 blur-[80px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-4 px-5 pt-12 pb-4">
        <button
          onClick={() => step > 0 ? setStep(0) : navigate('/login')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-bengali text-lg font-bold text-white">নতুন অ্যাকাউন্ট</h1>
          <p className="font-bengali text-xs text-white/40">ধাপ {step + 1} / {STEPS.length}</p>
        </div>
        {/* Step indicator */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'w-6 bg-primary' : 'w-3 bg-white/20'}`} />
          ))}
        </div>
      </div>

      {/* Form card */}
      <div className="relative z-10 mx-4 flex-1 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 px-6 pt-6 pb-8 shadow-2xl">

        {/* Step 0: Basic info */}
        {step === 0 && (
          <form onSubmit={goNext} className="space-y-4">
            <div className="mb-2">
              <p className="font-bengali font-bold text-white">প্রাথমিক তথ্য</p>
              <p className="font-bengali text-xs text-white/40">আপনার নাম, ইমেইল ও পাসওয়ার্ড দিন</p>
            </div>

            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">পূর্ণ নাম</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 focus-within:border-primary/60 transition">
                <User className="h-4 w-4 shrink-0 text-white/40" />
                <input
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম"
                  className="min-w-0 flex-1 bg-transparent font-bengali text-sm text-white placeholder:text-white/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">ইমেইল</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 focus-within:border-primary/60 transition">
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
              {/* Strength bar */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                  ))}
                </div>
              )}
              <p className="mt-1 font-bengali text-[11px] text-white/30">কমপক্ষে ৮ অক্ষর, ১টি বড় হাতের অক্ষর, ১টি সংখ্যা</p>
            </div>

            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">পাসওয়ার্ড নিশ্চিত করুন</label>
              <div className={`flex items-center gap-3 rounded-2xl border bg-white/10 px-4 py-3.5 transition ${confirmPass && confirmPass !== password ? 'border-red-400/50' : 'border-white/15 focus-within:border-primary/60'}`}>
                <Lock className="h-4 w-4 shrink-0 text-white/40" />
                <input
                  value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                  type="password" placeholder="পুনরায় দিন"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
              </div>
              {confirmPass && confirmPass !== password && (
                <p className="mt-1 font-bengali text-[11px] text-red-400">পাসওয়ার্ড মিলছে না</p>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/40 active:scale-[0.98] transition"
            >
              পরবর্তী ধাপ <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <form onSubmit={submit} className="space-y-4">
            <div className="mb-2">
              <p className="font-bengali font-bold text-white">অবস্থান তথ্য</p>
              <p className="font-bengali text-xs text-white/40">আপনার বিভাগ বেছে নিন (ঐচ্ছিক)</p>
            </div>

            <div>
              <label className="font-bengali mb-2 block text-xs font-semibold text-white/60">বিভাগ</label>
              <select
                value={division} onChange={(e) => setDivision(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 font-bengali text-sm text-white outline-none focus:border-primary/60 transition [&>option]:bg-[#1a2a4a] [&>option]:text-white"
              >
                {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
              <p className="font-bengali text-xs font-semibold text-white/40 mb-3">তথ্য সারসংক্ষেপ</p>
              {[['নাম', fullName], ['ইমেইল', email], ['বিভাগ', division]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="font-bengali text-white/40">{k}</span>
                  <span className="font-semibold text-white">{v}</span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-4 font-bengali font-bold text-white shadow-lg shadow-secondary/30 disabled:opacity-60 active:scale-[0.98] transition"
            >
              {loading ? <span className="animate-spin">⟳</span> : null}
              নিবন্ধন সম্পন্ন করুন
            </button>
          </form>
        )}

        <p className="mt-5 text-center font-bengali text-sm text-white/40">
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <button onClick={() => navigate('/login')} className="font-bold text-primary hover:underline">
            লগ ইন করুন
          </button>
        </p>
      </div>
    </main>
  );
};
