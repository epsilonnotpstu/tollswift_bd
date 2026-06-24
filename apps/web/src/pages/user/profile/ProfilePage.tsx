import { Bell, Car, ChevronRight, LogOut, Shield, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/shared';
import { useAuth } from '@/hooks/useAuth';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = [
    { icon: Car, label: 'আমার গাড়ি', to: '/vehicles' },
    { icon: Bell, label: 'নোটিফিকেশন', to: '/profile/settings' },
    { icon: Shield, label: 'নিরাপত্তা', to: '/profile/settings' }
  ];

  return (
    <main className="min-h-screen bg-bg pb-24">
      <section className="rounded-b-[32px] bg-primary px-5 pb-9 pt-12 text-center text-white">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white/15">
          {user?.photoUrl ? <img src={user.photoUrl} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10" />}
        </div>
        <h1 className="font-bengali text-xl font-bold">{user?.fullName ?? 'TollBD User'}</h1>
        <p className="text-sm text-white/75">{user?.email}</p>
        <div className="mt-3"><StatusBadge status={user?.status ?? 'ACTIVE'} /></div>
      </section>
      <section className="space-y-4 px-5 py-5">
        <div className="overflow-hidden rounded-app border border-border bg-surface">
          {items.map((item) => <button key={item.to} onClick={() => navigate(item.to)} className="flex w-full items-center gap-3 border-b border-border p-4 last:border-b-0"><item.icon className="h-5 w-5 text-primary" /><span className="flex-1 text-left font-bengali text-sm font-semibold">{item.label}</span><ChevronRight className="h-4 w-4 text-text-muted" /></button>)}
        </div>
        <button onClick={() => logout().then(() => navigate('/login', { replace: true }))} className="flex w-full items-center justify-center gap-2 rounded-app bg-red-50 py-4 font-bengali font-bold text-red-700"><LogOut className="h-4 w-4" /> লগ আউট</button>
        <p className="text-center text-xs text-text-muted">TollBD v1.0.0</p>
      </section>
    </main>
  );
};

