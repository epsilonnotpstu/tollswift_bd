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
    <main className="min-h-screen bg-bg pb-28">
      <AppBar title="Wallet" titleBn="আমার ওয়ালেট" />

      {/* Hero balance card */}
      <section className="relative overflow-hidden bg-primary px-5 pb-8 pt-6 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/8" />
        </div>
        <div className="relative text-center">
          <p className="font-bengali text-xs font-medium text-white/60">মোট ব্যালেন্স</p>
          <AmountDisplay amount={wallet.balance} size="xl" className="mt-1 text-white" />
          <button
            onClick={() => navigate('/wallet/deposit')}
            className="mx-auto mt-5 flex items-center gap-2 rounded-full bg-secondary px-6 py-3 font-bengali text-sm font-bold text-white shadow-lg shadow-secondary/30 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" /> টাকা যোগ করুন
          </button>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-3 px-5 py-5">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
          <p className="font-bengali text-xs font-medium text-emerald-700">এই মাসে জমা</p>
          <AmountDisplay amount={summary.credit} size="md" className="mt-1 !text-emerald-700" />
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
          <p className="font-bengali text-xs font-medium text-red-700">এই মাসে খরচ</p>
          <AmountDisplay amount={summary.debit} size="md" className="mt-1 !text-red-600" />
        </div>
      </section>

      <section className="px-5">
        {/* Filter chips */}
        <div className="mb-4 flex gap-2">
          {([['all', 'সব'], ['credit', 'জমা'], ['debit', 'খরচ']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 font-bengali text-xs font-bold transition ${filter === key ? 'bg-primary text-white shadow-sm' : 'border border-border/60 bg-surface text-text-secondary hover:border-border'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
          {txQuery.isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-border/50 p-4 last:border-b-0">
                  <div className="h-10 w-10 animate-pulse rounded-2xl bg-bg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded-full bg-bg" />
                    <div className="h-2.5 w-20 animate-pulse rounded-full bg-bg" />
                  </div>
                  <div className="h-4 w-16 animate-pulse rounded-full bg-bg" />
                </div>
              ))}
            </div>
          ) : filtered.length ? (
            filtered.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
          ) : (
            <div className="px-5 py-10 text-center">
              <p className="font-bengali text-sm text-text-muted">কোনো লেনদেন নেই</p>
            </div>
          )}
        </div>

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 py-3.5 font-bengali text-sm font-bold text-primary active:scale-[0.98] transition">
          <Download className="h-4 w-4" /> স্টেটমেন্ট ডাউনলোড
        </button>
      </section>
    </main>
  );
};

