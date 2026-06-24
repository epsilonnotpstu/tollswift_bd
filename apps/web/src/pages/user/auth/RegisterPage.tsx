import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import * as authApi from '@/api/auth.api';
import { AppBar } from '@/components/shared';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
});

const districts: Record<string, string[]> = {
  Dhaka: ['Dhaka', 'Gazipur', 'Narayanganj', 'Munshiganj'],
  Chattogram: ['Chattogram', 'Comilla', 'Coxs Bazar'],
  Rajshahi: ['Rajshahi', 'Sirajganj', 'Pabna'],
  Khulna: ['Khulna', 'Kushtia', 'Jashore']
};

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [photoName, setPhotoName] = useState('');
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error('নাম, ইমেইল এবং শক্তিশালী পাসওয়ার্ড দিন');
      return;
    }
    try {
      await authApi.register(parsed.data);
      toast.success('অ্যাকাউন্ট তৈরি হয়েছে, OTP যাচাই করুন');
      navigate('/otp', { state: { email } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <main className="min-h-screen bg-bg">
      <AppBar title="Register" titleBn="নিবন্ধন" showBack />
      <form onSubmit={submit} className="mx-auto max-w-md space-y-5 px-5 py-6">
        <div className="flex gap-2">
          {[1, 2].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-primary' : 'bg-border'}`} />)}
        </div>
        {step === 1 ? (
          <>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">পূর্ণ নাম</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-app border border-border bg-surface px-4 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">ইমেইল</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full rounded-app border border-border bg-surface px-4 py-3 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">পাসওয়ার্ড</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full rounded-app border border-border bg-surface px-4 py-3 outline-none focus:border-primary" />
              <p className="mt-1 text-xs text-text-muted">At least 8 chars, 1 uppercase, 1 number</p>
            </label>
            <button type="button" onClick={() => setStep(2)} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white">পরবর্তী</button>
          </>
        ) : (
          <>
            <label className="block">
              <span className="mb-1.5 block font-bengali text-sm font-semibold">প্রোফাইল ছবি</span>
              <input type="file" accept="image/*" onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? '')} className="w-full rounded-app border border-border bg-surface px-4 py-3 text-sm" />
              {photoName ? <p className="mt-1 text-xs text-primary">{photoName}</p> : null}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block font-bengali text-sm font-semibold">বিভাগ</span>
                <select value={division} onChange={(event) => { setDivision(event.target.value); setDistrict(districts[event.target.value][0]); }} className="w-full rounded-app border border-border bg-surface px-3 py-3">
                  {Object.keys(districts).map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block font-bengali text-sm font-semibold">জেলা</span>
                <select value={district} onChange={(event) => setDistrict(event.target.value)} className="w-full rounded-app border border-border bg-surface px-3 py-3">
                  {districts[division].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <button className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white">নিবন্ধন করুন</button>
          </>
        )}
      </form>
    </main>
  );
};

