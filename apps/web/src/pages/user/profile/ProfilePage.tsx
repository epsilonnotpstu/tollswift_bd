import { FormEvent, useState } from 'react';
import { Bell, Camera, Car, ChevronRight, Edit2, LogOut, Shield, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { updateMe } from '@/api/user.api';
import { StatusBadge } from '@/components/shared';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => updateMe({ fullName: fullName.trim(), phone: phone.trim() || undefined }),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('প্রোফাইল আপডেট হয়েছে');
      setEditOpen(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed')
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return toast.error('নাম দিন');
    saveMutation.mutate();
  };

  const items = [
    { icon: Car, label: 'আমার গাড়ি', to: '/vehicles' },
    { icon: Bell, label: 'নোটিফিকেশন সেটিং', to: '/profile/settings' },
    { icon: Shield, label: 'নিরাপত্তা', to: '/profile/settings' }
  ];

  return (
    <main className="min-h-screen bg-bg pb-28">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-5 pb-10 pt-[calc(env(safe-area-inset-top)+48px)] text-center text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 left-1/3 h-48 w-48 rounded-full bg-white/8" />
        </div>
        <div className="relative">
          <div className="relative mx-auto mb-4 h-24 w-24">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white/15 shadow-xl">
              {user?.photoUrl ? (
                <img src={user.photoUrl} className="h-full w-full object-cover" alt={user.fullName ?? ''} />
              ) : (
                <UserRound className="h-11 w-11" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-secondary shadow-lg">
              <Camera className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
          <h1 className="font-bengali text-xl font-bold">{user?.fullName ?? 'TollBD User'}</h1>
          <p className="mt-0.5 text-sm text-white/70">{user?.email}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <StatusBadge status={user?.status ?? 'ACTIVE'} />
            <button
              onClick={() => { setFullName(user?.fullName ?? ''); setPhone(user?.phone ?? ''); setEditOpen(true); }}
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold hover:bg-white/25 transition"
            >
              <Edit2 className="h-3 w-3" /> সম্পাদনা
            </button>
          </div>
        </div>
      </section>

      {/* Info */}
      {(user?.phone || user?.division || user?.nidNumber) && (
        <section className="mx-5 mt-5 overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
          {user.phone && (
            <div className="flex justify-between border-b border-border/50 px-4 py-3 text-sm last:border-b-0">
              <span className="font-bengali text-text-muted">ফোন</span>
              <span className="font-semibold text-text-primary">{user.phone}</span>
            </div>
          )}
          {user.division && (
            <div className="flex justify-between border-b border-border/50 px-4 py-3 text-sm last:border-b-0">
              <span className="font-bengali text-text-muted">বিভাগ</span>
              <span className="font-semibold text-text-primary">{user.division}</span>
            </div>
          )}
          {user.nidNumber && (
            <div className="flex justify-between px-4 py-3 text-sm">
              <span className="font-bengali text-text-muted">NID</span>
              <span className="font-semibold text-text-primary">{'•'.repeat(Math.max(0, user.nidNumber.length - 4))}{user.nidNumber.slice(-4)}</span>
            </div>
          )}
        </section>
      )}

      {/* Menu */}
      <section className="mx-5 mt-5 overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
        {items.map((item, i) => (
          <button
            key={item.to + i}
            onClick={() => navigate(item.to)}
            className="flex w-full items-center gap-3.5 border-b border-border/50 p-4 transition last:border-b-0 active:bg-bg/50 hover:bg-bg/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-[18px] w-[18px] text-primary" />
            </span>
            <span className="flex-1 text-left font-bengali text-sm font-semibold text-text-primary">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-text-muted" />
          </button>
        ))}
      </section>

      {/* Logout */}
      <section className="mx-5 mt-4 space-y-3 pb-2">
        <button
          onClick={() => logout().then(() => navigate('/login', { replace: true }))}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 font-bengali font-bold text-red-600 transition active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" /> লগ আউট
        </button>
        <p className="text-center text-xs text-text-muted">TollBD v1.0.0</p>
      </section>

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-0 sm:items-center sm:px-5" onClick={() => setEditOpen(false)}>
          <div
            className="w-full max-w-md rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bengali text-base font-bold text-text-primary">প্রোফাইল সম্পাদনা</h2>
              <button onClick={() => setEditOpen(false)} className="rounded-full p-1.5 hover:bg-bg text-text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-bengali mb-2 block text-xs font-semibold text-text-muted">পূর্ণ নাম *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-border/60 bg-bg px-4 py-3.5 font-bengali text-sm text-text-primary outline-none focus:border-primary/50 transition"
                  placeholder="আপনার পূর্ণ নাম"
                />
              </div>
              <div>
                <label className="font-bengali mb-2 block text-xs font-semibold text-text-muted">মোবাইল নম্বর</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-border/60 bg-bg px-4 py-3.5 text-sm text-text-primary outline-none focus:border-primary/50 transition"
                  placeholder="01XXXXXXXXX"
                  type="tel"
                />
              </div>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-60 active:scale-[0.98] transition"
              >
                {saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
