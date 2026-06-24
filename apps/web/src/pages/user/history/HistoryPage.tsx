import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/api/toll.api';
import { AmountDisplay, AppBar, TransactionRow } from '@/components/shared';

export const HistoryPage = () => {
  const [status, setStatus] = useState<string | undefined>();
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['transactions', status], queryFn: () => getTransactions(1, 50, status) });
  const total = useMemo(() => (query.data?.items ?? []).reduce((sum, item) => sum + item.amount, 0), [query.data]);

  return (
    <main className="min-h-screen bg-bg pb-24">
      <AppBar title="History" titleBn="পেমেন্ট ইতিহাস" />
      <section className="space-y-4 px-5 py-5">
        <div className="rounded-app border border-amber-200 bg-amber-50 p-4">
          <p className="font-bengali text-sm font-bold text-text-primary">এই মাসে মোট খরচ</p>
          <AmountDisplay amount={total} colored />
          <p className="text-xs text-text-muted">{query.data?.total ?? 0} টি লেনদেন</p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            [undefined, 'সব'],
            ['SUCCESS', 'সফল'],
            ['PENDING', 'পেন্ডিং'],
            ['REFUNDED', 'রিফান্ড']
          ].map(([key, label]) => <button key={String(label)} onClick={() => setStatus(key)} className={`rounded-full px-4 py-2 font-bengali text-xs font-bold ${status === key ? 'bg-primary text-white' : 'border border-border bg-surface text-text-secondary'}`}>{label}</button>)}
        </div>
        <div className="overflow-hidden rounded-app border border-border bg-surface">
          {query.data?.items.length ? query.data.items.map((tx) => <TransactionRow key={tx.id} transaction={tx} onTap={() => navigate(`/history/${tx.id}`)} />) : <p className="p-5 font-bengali text-sm text-text-muted">লেনদেন নেই</p>}
        </div>
      </section>
    </main>
  );
};

