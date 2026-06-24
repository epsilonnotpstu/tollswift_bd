import { useState } from 'react';
import { ArrowDownLeft, Copy, Download, RotateCcw, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllTransactions, refundTransaction } from '@/api/admin.api';
import { Transaction, TransactionStatus } from '@/types/transaction.types';
import { DataTable, Column } from '@/components/admin';
import { formatBDT, formatDateTime } from '@/utils/format';

const statusConfig: Record<TransactionStatus, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-blue-100 text-blue-700'
};

const STATUS_TABS: Array<TransactionStatus | ''> = ['', 'SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'];

const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied'); };

const exportCSV = (items: Transaction[]) => {
  const header = 'ID,Type,Amount,Bridge,Plate,Method,Status,Date';
  const rows = items.map((t) =>
    `${t.id},${t.type},${t.amount},${t.bridgeName ?? ''},${t.vehiclePlate ?? ''},${t.paymentMethod},${t.status},${t.createdAt}`
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'transactions.csv'; a.click();
};

export const AdminTransactionsPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('');
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmt, setRefundAmt] = useState('');
  const [detail, setDetail] = useState<Transaction | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', statusFilter, page],
    queryFn: () => getAllTransactions({ status: statusFilter || undefined, page, limit: 25 }),
    placeholderData: (prev) => prev
  });

  const refundMut = useMutation({
    mutationFn: () => refundTransaction(refunding!.id, refundReason, refundAmt ? Number(refundAmt) * 100 : undefined),
    onSuccess: () => {
      toast.success('Refund processed');
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      setRefunding(null); setRefundReason(''); setRefundAmt('');
    },
    onError: () => toast.error('Refund failed')
  });

  const columns: Column<Transaction>[] = [
    {
      header: 'Transaction', accessor: 'id',
      render: (tx) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-gray-700">{tx.id.slice(0, 12)}…</span>
            <button onClick={(e) => { e.stopPropagation(); copy(tx.id); }} className="text-gray-300 hover:text-gray-500">
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <span className="text-[10px] text-gray-400">{tx.type}</span>
        </div>
      )
    },
    {
      header: 'Bridge / Vehicle', accessor: 'bridgeName',
      render: (tx) => (
        <div>
          <p className="text-sm text-gray-900">{tx.bridgeName ?? '—'}</p>
          <p className="text-xs text-gray-400">{tx.vehiclePlate ?? '—'}</p>
        </div>
      )
    },
    {
      header: 'Amount', accessor: 'amount', align: 'right',
      render: (tx) => <span className="text-sm font-bold text-gray-900">{formatBDT(tx.amount)}</span>
    },
    {
      header: 'Method', accessor: 'paymentMethod',
      render: (tx) => <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-bold text-gray-600">{tx.paymentMethod}</span>
    },
    {
      header: 'Status', accessor: 'status',
      render: (tx) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusConfig[tx.status]}`}>{tx.status}</span>
    },
    { header: 'Date', accessor: 'createdAt', render: (tx) => <span className="text-xs text-gray-400">{formatDateTime(tx.createdAt)}</span> },
    {
      header: '', accessor: 'id' as keyof Transaction, align: 'right',
      render: (tx) => tx.status === 'SUCCESS' ? (
        <button
          onClick={(e) => { e.stopPropagation(); setRefunding(tx); }}
          className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
        >
          <RotateCcw className="h-3 w-3" /> Refund
        </button>
      ) : null
    }
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl bg-white p-1 shadow-sm border border-gray-100">
          {STATUS_TABS.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${statusFilter === s ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <button onClick={() => data?.items && exportCSV(data.items)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <DataTable
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          data={(data?.items ?? []) as unknown as Record<string, unknown>[]}
          isLoading={isLoading}
          page={page}
          totalPages={data ? Math.ceil(data.total / 25) : 1}
          totalItems={data?.total}
          pageSize={25}
          onPageChange={setPage}
          onRowClick={(row) => setDetail(row as unknown as Transaction)}
          emptyMessage="No transactions found"
        />
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetail(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-md bg-white shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-bold text-gray-900">Transaction Detail</h2>
              <button onClick={() => setDetail(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-gray-50 p-5 text-center">
                <p className="text-3xl font-bold text-gray-900">{formatBDT(detail.amount)}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${statusConfig[detail.status]}`}>{detail.status}</span>
              </div>
              {([
                ['Transaction ID', detail.id],
                ['Type', detail.type],
                ['Bridge', detail.bridgeName ?? '—'],
                ['Vehicle', detail.vehiclePlate ?? '—'],
                ['Payment Method', detail.paymentMethod],
                ['Date', formatDateTime(detail.createdAt)],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-gray-50 py-2">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 max-w-[55%] text-right break-all">{val}</span>
                </div>
              ))}
              {detail.status === 'SUCCESS' && (
                <button onClick={() => { setRefunding(detail); setDetail(null); }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-white hover:bg-amber-600 transition">
                  <RotateCcw className="h-4 w-4" /> Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {refunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <ArrowDownLeft className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-center font-bold text-gray-900">Process Refund</h2>
            <p className="mt-1 text-center text-sm text-gray-500">{formatBDT(refunding.amount)} · {refunding.bridgeName}</p>
            <div className="mt-4 space-y-3">
              <input value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="Reason (required)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              <input type="number" value={refundAmt} onChange={(e) => setRefundAmt(e.target.value)} placeholder="Amount in ৳ (leave blank for full refund)"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setRefunding(null)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => refundMut.mutate()} disabled={!refundReason || refundMut.isPending}
                className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white disabled:opacity-50">
                {refundMut.isPending ? 'Processing…' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
