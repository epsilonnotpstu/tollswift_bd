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
    <main className="min-h-screen bg-bg pb-24">
      <AppBar title="History" titleBn="পেমেন্ট ইতিহাস" />

      <section className="px-5 pt-5 pb-4">
        {/* Summary card */}
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div>
            <p className="font-bengali text-xs text-text-muted">মোট সফল পেমেন্ট</p>
            <AmountDisplay amount={total} size="lg" colored className="mt-1" />
            <p className="font-bengali mt-0.5 text-xs text-text-muted">{items.filter((t) => t.status === 'SUCCESS').length} টি ট্রিপ</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
            <TrendingDown className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Status filter */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(([key, label]) => (
            <button
              key={String(label)}
              onClick={() => setStatus(key)}
              className={`shrink-0 rounded-full px-4 py-2 font-bengali text-xs font-bold transition ${
                status === key ? 'bg-primary text-white' : 'border border-border bg-surface text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pb-6 space-y-5">
        {query.isLoading ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <SkeletonList count={5} />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-5 py-12 text-center shadow-sm">
            <p className="font-bengali text-text-muted">কোনো লেনদেন পাওয়া যায়নি</p>
            <button
              onClick={() => navigate('/toll/select-bridge')}
              className="mt-3 rounded-full bg-primary-50 px-5 py-2 font-bengali text-sm font-bold text-primary"
            >
              প্রথম টোল দিন
            </button>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([day, txs]) => (
            <div key={day}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-text-muted">{day}</p>
                <p className="text-xs font-semibold text-text-muted">
                  {formatBDT(txs.filter((t) => t.status === 'SUCCESS').reduce((s, t) => s + t.amount, 0))}
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
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
