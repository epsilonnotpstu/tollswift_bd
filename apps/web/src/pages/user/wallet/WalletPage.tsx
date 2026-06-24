import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/api/wallet.api';
import { AmountDisplay, AppBar, TransactionRow } from '@/components/shared';
import { useWallet } from '@/hooks/useWallet';

export const WalletPage = () => {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const navigate = useNavigate();
  const wallet = useWallet();
  const txQuery = useQuery({ queryKey: ['wallet-transactions'], queryFn: () => getTransactions(1, 50) });
  const filtered = (txQuery.data?.items ?? []).filter((item) => filter === 'all' || item.type.toLowerCase() === filter);
  const summary = useMemo(() => {
    const txs = txQuery.data?.items ?? [];
    return {
      credit: txs.filter((item) => item.type === 'CREDIT').reduce((sum, item) => sum + item.amount, 0),
      debit: txs.filter((item) => item.type === 'DEBIT').reduce((sum, item) => sum + item.amount, 0)
    };
  }, [txQuery.data]);

  return (
    <main className="min-h-screen bg-bg pb-24">
      <AppBar title="Wallet" titleBn="আমার ওয়ালেট" />
      <section className="rounded-b-[28px] bg-primary px-5 py-8 text-center text-white">
        <p className="font-bengali text-sm text-white/70">মোট ব্যালেন্স</p>
        <AmountDisplay amount={wallet.balance} size="xl" className="text-white" />
        <button onClick={() => navigate('/wallet/deposit')} className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-bengali text-sm font-bold text-text-primary">
          <Plus className="h-4 w-4" /> টাকা যোগ করুন
        </button>
      </section>
      <section className="grid grid-cols-2 gap-3 px-5 py-5">
        <div className="rounded-app bg-green-50 p-4 text-center">
          <p className="font-bengali text-xs text-green-700">এই মাসে জমা</p>
          <AmountDisplay amount={summary.credit} size="sm" className="text-green-700" />
        </div>
        <div className="rounded-app bg-red-50 p-4 text-center">
          <p className="font-bengali text-xs text-red-700">এই মাসে খরচ</p>
          <AmountDisplay amount={summary.debit} size="sm" className="text-red-700" />
        </div>
      </section>
      <section className="px-5">
        <div className="mb-4 flex gap-2">
          {[
            ['all', 'সব'],
            ['credit', 'জমা'],
            ['debit', 'খরচ']
          ].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key as typeof filter)} className={`rounded-full px-4 py-2 font-bengali text-xs font-bold ${filter === key ? 'bg-primary text-white' : 'border border-border bg-surface text-text-secondary'}`}>{label}</button>
          ))}
        </div>
        <div className="overflow-hidden rounded-app border border-border bg-surface">
          {filtered.length ? filtered.map((tx) => <TransactionRow key={tx.id} transaction={tx} />) : <p className="p-5 font-bengali text-sm text-text-muted">লেনদেন নেই</p>}
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-app border border-primary bg-primary-50 py-3 font-bengali text-sm font-bold text-primary">
          <Download className="h-4 w-4" /> স্টেটমেন্ট ডাউনলোড
        </button>
      </section>
    </main>
  );
};

