import { useMemo, useState } from 'react';
import { TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/api/toll.api';
import { AmountDisplay, AppBar, SkeletonList, TransactionRow } from '@/components/shared';
import { formatBDT } from '@/utils/format';
import type { Transaction } from '@/types/transaction.types';

const groupByDate = (items: Transaction[]) => {
  const groups = new Map<string, Transaction[]>();
  for (const tx of items) {
    const day = new Date(tx.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(tx);
  }
  return groups;
};

const FILTERS = [
  [undefined, 'সব'],
  ['SUCCESS', 'সফল'],
  ['PENDING', 'পেন্ডিং'],
  ['REFUNDED', 'রিফান্ড']
] as const;

export const HistoryPage = () => {
  const [status, setStatus] = useState<string | undefined>();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['transactions', status], queryFn: () => getTransactions(1, 100, status) });
  const items = query.data?.items ?? [];
  const total = useMemo(() => items.filter((t) => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0), [items]);
  const grouped = useMemo(() => groupByDate(items), [items]);

  return (
    <main className="min-h-screen bg-bg pb-28">
      <AppBar title="History" titleBn="পেমেন্ট ইতিহাস" />

      <section className="px-5 pt-5 pb-4">
        {/* Summary card */}
        <div className="flex items-center justify-between overflow-hidden rounded-2xl bg-primary p-5 text-white shadow-xl shadow-primary/30">
          <div>
            <p className="font-bengali text-xs font-medium text-white/60">মোট সফল পেমেন্ট</p>
            <AmountDisplay amount={total} size="lg" className="mt-1 text-white" />
            <p className="font-bengali mt-1 text-xs text-white/50">{items.filter((t) => t.status === 'SUCCESS').length} টি ট্রিপ সম্পন্ন</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <TrendingDown className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Status filter */}
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {FILTERS.map(([key, label]) => (
            <button
              key={String(label)}
              onClick={() => setStatus(key)}
              className={`shrink-0 rounded-full px-4 py-2 font-bengali text-xs font-bold transition ${
                status === key ? 'bg-primary text-white shadow-sm' : 'border border-border/60 bg-surface text-text-secondary hover:border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4 px-5 pb-6">
        {query.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface p-4">
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-bg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded-full bg-bg" />
                  <div className="h-2.5 w-20 animate-pulse rounded-full bg-bg" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface px-5 py-14 text-center">
            <p className="text-3xl">🏁</p>
            <p className="mt-3 font-bengali text-sm text-text-muted">কোনো লেনদেন পাওয়া যায়নি</p>
            <button
              onClick={() => navigate('/toll/select-bridge')}
              className="mt-4 rounded-full bg-primary px-6 py-2.5 font-bengali text-sm font-bold text-white shadow-lg shadow-primary/25"
            >
              প্রথম টোল দিন
            </button>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([day, txs]) => (
            <div key={day}>
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-text-muted">{day}</p>
                <p className="text-xs font-bold text-primary">
                  {formatBDT(txs.filter((t) => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0))}
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-sm">
                {txs.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} onTap={() => navigate(`/history/${tx.id}`)} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
};
