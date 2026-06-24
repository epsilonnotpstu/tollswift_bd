import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const SplashPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
        return;
      }
      navigate(localStorage.getItem('hasSeenOnboarding') ? '/login' : '/onboarding', { replace: true });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary px-6 text-center text-white">
      <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-white/15 text-5xl shadow-lg">🌉</div>
      <h1 className="mt-5 text-4xl font-bold">TollBD</h1>
      <p className="font-bengali text-lg text-white/80">টোলবিডি</p>
      <p className="mt-3 text-sm text-white/75">Smart Toll. Faster Bangladesh.</p>
      <p className="font-bengali text-xs text-white/60">স্মার্ট টোল। দ্রুত বাংলাদেশ।</p>
      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map((item) => (
          <span key={item} className="h-2 w-2 animate-pulse rounded-full bg-white" style={{ animationDelay: `${item * 160}ms` }} />
        ))}
      </div>
    </main>
  );
};

