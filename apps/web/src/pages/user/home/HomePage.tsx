import { useState } from 'react';
import { Bell, Car, Eye, EyeOff, History, Plus, QrCode, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncements, type Announcement } from '@/api/admin.api';
import { getBridges } from '@/api/bridge.api';
import { getTransactions } from '@/api/toll.api';
import { AmountDisplay, BridgeCard, SkeletonList, TransactionRow } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useWallet } from '@/hooks/useWallet';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'সুপ্রভাত';
  if (h < 17) return 'শুভ অপরাহ্ন';
  return 'শুভ সন্ধ্যা';
};

const ANNOUNCE_COLOR = {
  INFO: 'border-blue-200 bg-blue-50',
  WARNING: 'border-amber-200 bg-amber-50',
  MAINTENANCE: 'border-gray-200 bg-gray-50'
} as const;

export const HomePage = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const wallet = useWallet();
  const bridgeQuery = useQuery({ queryKey: ['bridges', 'home'], queryFn: () => getBridges({ status: 'ACTIVE' }) });
  const txQuery = useQuery({ queryKey: ['transactions', 'recent'], queryFn: () => getTransactions(1, 3) });
  const announcementsQuery = useQuery({ queryKey: ['announcements'], queryFn: () => getAnnouncements(false), staleTime: 5 * 60_000 });

  const activeAnn = (announcementsQuery.data ?? [] as Announcement[]).filter(
    (a: Announcement) => a.isActive && (!a.expiresAt || new Date(a.expiresAt) > new Date())
  );

  const actions = [
    { icon: ReceiptText, label: 'টোল দিন', to: '/toll/select-bridge', bg: 'bg-primary-50', color: 'text-primary' },
    { icon: QrCode, label: 'QR দেখান', to: '/qr', bg: 'bg-green-50', color: 'text-secondary' },
    { icon: Car, label: 'গাড়ি যোগ', to: '/vehicles/add', bg: 'bg-purple-50', color: 'text-purple-600' },
    { icon: History, label: 'ইতিহাস', to: '/history', bg: 'bg-amber-50', color: 'text-amber-600' }
  ];

  return (
    <main className="min-h-screen bg-bg pb-28">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-5 pb-10 pt-[calc(env(safe-area-inset-top)+48px)] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-white/8" />
          <div className="absolute right-1/4 top-1/2 h-32 w-32 rounded-full bg-secondary/20 blur-2xl" />
        </div>
        <div className="relative">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-bengali text-[11px] font-medium text-white/60">{greet()} 👋</p>
              <h1 className="font-bengali text-xl font-bold leading-tight">{user?.fullName ?? 'TollBD ব্যবহারকারী'}</h1>
            </div>
            <button
              onClick={() => navigate('/profile/settings')}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm"
            >
              <Bell className="h-[18px] w-[18px]" />
              {activeAnn.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-accent" />
              )}
            </button>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur-sm ring-1 ring-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bengali text-[11px] font-medium text-white/60">ওয়ালেট ব্যালেন্স</p>
                <div className="mt-1">
                  {balanceVisible ? (
                    <AmountDisplay amount={wallet.balance} size="xl" className="text-white" />
                  ) : (
                    <p className="text-3xl font-bold tracking-[0.3em] text-white">••••</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setBalanceVisible((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                {balanceVisible ? <EyeOff className="h-4 w-4 text-white" /> : <Eye className="h-4 w-4 text-white" />}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="font-bengali text-xs text-white/50">
                {wallet.isLoading ? 'লোড হচ্ছে...' : 'লাইভ ব্যালেন্স'}
              </p>
              <button
                onClick={() => navigate('/wallet/deposit')}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 font-bengali text-xs font-bold text-white shadow-lg shadow-secondary/30 active:scale-95 transition"
              >
                <Plus className="h-3.5 w-3.5" /> টাকা যোগ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-3 px-5 py-5">
        {actions.map((a) => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-surface px-1.5 py-4 shadow-sm transition active:scale-95 hover:shadow-md"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${a.bg}`}>
              <a.icon className={`h-5 w-5 ${a.color}`} />
            </span>
            <span className="font-bengali text-[11px] font-semibold text-text-primary leading-tight text-center">{a.label}</span>
          </button>
        ))}
      </section>

      {/* Announcements */}
      {activeAnn.length > 0 && (
        <section className="space-y-2.5 px-5 pb-2">
          {activeAnn.slice(0, 2).map((ann) => (
            <div
              key={ann.id}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${ANNOUNCE_COLOR[ann.type as keyof typeof ANNOUNCE_COLOR] ?? ANNOUNCE_COLOR.INFO}`}
            >
              <span className="text-base">{ann.type === 'WARNING' ? '⚠️' : ann.type === 'MAINTENANCE' ? '🔧' : 'ℹ️'}</span>
              <div className="min-w-0">
                <p className="font-bengali text-sm font-bold text-text-primary">{ann.titleBn}</p>
                <p className="font-bengali mt-0.5 text-xs text-text-secondary leading-relaxed">{ann.bodyBn}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Recent transactions */}
      <section className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bengali text-sm font-bold text-text-primary">সাম্প্রতিক ট্রিপ</h2>
          <button onClick={() => navigate('/history')} className="font-bengali text-xs font-bold text-primary">সব দেখুন →</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
          {txQuery.isLoading ? (
            <SkeletonList count={2} />
          ) : txQuery.data?.items.length ? (
            txQuery.data.items.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} onTap={() => navigate(`/history/${tx.id}`)} />
            ))
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="text-2xl">🏁</p>
              <p className="mt-2 font-bengali text-sm font-medium text-text-muted">এখনও কোনো ট্রিপ নেই</p>
              <button
                onClick={() => navigate('/toll/select-bridge')}
                className="mt-3 rounded-full bg-primary px-5 py-2 font-bengali text-xs font-bold text-white"
              >
                প্রথম টোল দিন
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Popular bridges */}
      {bridgeQuery.data?.length ? (
        <section className="pb-6">
          <div className="mb-3 flex items-center justify-between px-5">
            <h2 className="font-bengali text-sm font-bold text-text-primary">জনপ্রিয় সেতু</h2>
            <button onClick={() => navigate('/toll/select-bridge')} className="font-bengali text-xs font-bold text-primary">সব দেখুন →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
            {bridgeQuery.data.slice(0, 6).map((bridge) => (
              <div key={bridge.id} className="w-72 shrink-0">
                <BridgeCard
                  bridge={bridge}
                  tollRate={bridge.tollRate?.rateB}
                  onTap={() => navigate('/toll/select-bridge')}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
};
