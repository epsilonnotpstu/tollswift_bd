import { useState } from 'react';
import { Bell, Car, History, Plus, QrCode, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBridges } from '@/api/bridge.api';
import { getTransactions } from '@/api/toll.api';
import { AmountDisplay, BridgeCard, SkeletonList, TransactionRow } from '@/components/shared';
import { useAuthStore } from '@/store/authStore';
import { useWallet } from '@/hooks/useWallet';

export const HomePage = () => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const wallet = useWallet();
  const bridgeQuery = useQuery({ queryKey: ['bridges', 'home'], queryFn: () => getBridges({ status: 'ACTIVE' }) });
  const txQuery = useQuery({ queryKey: ['transactions', 'recent'], queryFn: () => getTransactions(1, 3) });

  const actions = [
    { icon: ReceiptText, label: 'টোল দিন', to: '/toll/select-bridge' },
    { icon: QrCode, label: 'QR দেখান', to: '/qr' },
    { icon: Car, label: 'গাড়ি যোগ', to: '/vehicles/add' },
    { icon: History, label: 'ইতিহাস', to: '/history' }
  ];

  return (
    <main className="min-h-screen bg-bg pb-24">
      <section className="rounded-b-[28px] bg-primary px-5 pb-7 pt-12 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-bengali text-xs text-white/70">শুভেচ্ছা</p>
            <h1 className="font-bengali text-lg font-bold">{user?.fullName ?? 'TollBD User'}</h1>
          </div>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" />
          </button>
        </div>
        <div className="rounded-app bg-surface p-4 text-text-primary shadow-lg">
          <p className="font-bengali text-xs text-text-secondary">আপনার ওয়ালেট ব্যালেন্স</p>
          <div className="mt-1 flex items-center justify-between">
            <span className={visible ? '' : 'blur-sm'}><AmountDisplay amount={wallet.balance} size="lg" /></span>
            <button onClick={() => setVisible((value) => !value)} className="text-xs font-bold text-primary">{visible ? 'Hide' : 'Show'}</button>
          </div>
          <button onClick={() => navigate('/wallet/deposit')} className="mt-3 flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-bengali text-xs font-bold text-white">
            <Plus className="h-4 w-4" /> টাকা যোগ করুন
          </button>
        </div>
      </section>
      <section className="grid grid-cols-4 gap-3 px-5 py-5">
        {actions.map((action) => (
          <button key={action.to} onClick={() => navigate(action.to)} className="rounded-app border border-border bg-surface px-2 py-4 shadow-sm">
            <action.icon className="mx-auto h-6 w-6 text-primary" />
            <span className="mt-2 block font-bengali text-[11px] font-semibold text-text-primary">{action.label}</span>
          </button>
        ))}
      </section>
      <section className="mx-5 rounded-app border-l-4 border-primary bg-primary-50 px-4 py-3">
        <p className="font-bengali text-sm font-bold text-primary">যানবাহন যাচাই এখন ম্যানুয়াল</p>
        <p className="font-bengali text-xs text-text-secondary">Admin approval পেলেই QR ও টোল পেমেন্ট চালু হবে।</p>
      </section>
      <section className="px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bengali font-bold">সাম্প্রতিক ট্রিপ</h2>
          <button onClick={() => navigate('/history')} className="font-bengali text-xs font-bold text-primary">সব দেখুন</button>
        </div>
        <div className="overflow-hidden rounded-app border border-border bg-surface">
          {txQuery.isLoading ? <SkeletonList count={2} /> : txQuery.data?.items.length ? txQuery.data.items.map((tx) => <TransactionRow key={tx.id} transaction={tx} onTap={() => navigate(`/history/${tx.id}`)} />) : <p className="p-4 font-bengali text-sm text-text-muted">এখনও কোনো ট্রিপ নেই</p>}
        </div>
      </section>
      <section className="pb-4">
        <div className="mb-3 flex items-center justify-between px-5">
          <h2 className="font-bengali font-bold">জনপ্রিয় সেতু</h2>
          <button onClick={() => navigate('/toll/select-bridge')} className="font-bengali text-xs font-bold text-primary">সব দেখুন</button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2">
          {bridgeQuery.data?.slice(0, 6).map((bridge) => (
            <div key={bridge.id} className="w-72 shrink-0">
              <BridgeCard bridge={bridge} onTap={() => navigate('/toll/select-bridge')} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

