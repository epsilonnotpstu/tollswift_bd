import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  { icon: '📱', title: 'নিবন্ধন করুন', subtitle: 'Register Easily', body: 'ইমেইল OTP দিয়ে দ্রুত অ্যাকাউন্ট তৈরি করুন এবং স্মার্ট টোল সেবা শুরু করুন।' },
  { icon: '💳', title: 'ওয়ালেট ব্যবহার করুন', subtitle: 'Digital Wallet', body: 'SSLCommerz, bKash, Nagad বা কার্ড দিয়ে ওয়ালেট রিচার্জ করুন।' },
  { icon: '🌉', title: 'QR দিয়ে দ্রুত পার হন', subtitle: 'Fast Lane Access', body: 'টোল গেটে QR দেখান, যাচাইকৃত গাড়ির জন্য কয়েক সেকেন্ডে পেমেন্ট সম্পন্ন করুন।' }
];

export const OnboardingPage = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = slides[current];

  const finish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/login', { replace: true });
  };

  const next = () => {
    if (current === slides.length - 1) finish();
    else setCurrent((value) => value + 1);
  };

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <section className="flex flex-1 snap-x snap-mandatory overflow-hidden bg-gradient-to-br from-primary-50 to-green-50">
        <div className="flex w-full shrink-0 snap-center flex-col items-center justify-center px-8 text-center">
          <div className="text-8xl">{slide.icon}</div>
          <div className="mt-8 flex gap-2">
            {slides.map((_, index) => (
              <span key={index} className={`h-1.5 rounded-full transition-all ${index === current ? 'w-9 bg-primary' : 'w-2 bg-border'}`} />
            ))}
          </div>
        </div>
      </section>
      <section className="-mt-8 rounded-t-[32px] bg-surface px-6 pb-10 pt-7 shadow-2xl">
        <p className="w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary">STEP {current + 1} OF 3</p>
        <h1 className="mt-4 font-bengali text-3xl font-bold text-text-primary">{slide.title}</h1>
        <p className="font-semibold text-text-secondary">{slide.subtitle}</p>
        <p className="mt-3 font-bengali text-sm leading-6 text-text-secondary">{slide.body}</p>
        <div className="mt-7 flex items-center justify-between">
          <button onClick={finish} className="rounded-app px-4 py-3 font-bengali text-sm font-semibold text-text-muted">এড়িয়ে যান</button>
          <button onClick={next} className="flex items-center gap-2 rounded-app bg-primary px-5 py-3 font-bengali text-sm font-bold text-white">
            {current === slides.length - 1 ? 'শুরু করুন' : 'পরবর্তী'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
};

