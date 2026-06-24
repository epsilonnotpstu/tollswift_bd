import { useState } from 'react';
import { ReceiptText, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllTransactions, refundTransaction } from '@/api/admin.api';
import { formatBDT, formatDateTime } from '@/utils/format';

const STATUS_COLOR: Record<string, string> = {
  SUCCESS: 'bg-green-50 text-green-700',
  PENDING: 'bg-amber-50 text-amber-700',
  FAILED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-purple-50 text-purple-700'
};

const METHOD_COLOR: Record<string, string> = {
  WALLET: 'bg-blue-50 text-blue-700',
  SSLCOMMERZ: 'bg-teal-50 text-teal-700',
  BKASH: 'bg-pink-50 text-pink-700',
  NAGAD: 'bg-orange-50 text-orange-700',
  CARD: 'bg-gray-50 text-gray-700'
};

export const AdminTransactionsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [refundId, setRefundId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-transactions', statusFilter, page],
    queryFn: () => getAllTransactions({ status: statusFilter || undefined, page, limit: 20 })
  });

  const doRefund = useMutation({
    mutationFn: () => refundTransaction(refundId!, refundReason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      toast.success('Refund processed');
      setRefundId(null);
      setRefundReason('');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Refund failed')
  });

  const txs = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Transactions</h1>
          <p className="text-sm text-text-secondary">{total.toLocaleString()} total</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none"
        >
          <option value="">All</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {query.isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : txs.length === 0 ? (
          <div className="py-16 text-center">
            <ReceiptText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 font-bold text-text-primary">No transactions</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3">Bridge</th>
                  <th className="hidden px-4 py-3 md:table-cell">Vehicle</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="hidden px-4 py-3 md:table-cell">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 font-medium text-text-primary">{tx.bridgeName}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-text-secondary md:table-cell">
                      {tx.vehiclePlate}
                    </td>
                    <td className="px-4 py-3 font-bold text-text-primary">{formatBDT(tx.amount)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${METHOD_COLOR[tx.paymentMethod]}`}>
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_COLOR[tx.status]}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-text-muted lg:table-cell">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tx.status === 'SUCCESS' ? (
                        <button
                          onClick={() => setRefundId(tx.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-purple-600"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Refund
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pages > 1 ? (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-xs font-semibold text-primary disabled:text-text-muted"
                >
                  Previous
                </button>
                <span className="text-xs text-text-muted">
                  {page} / {pages}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs font-semibold text-primary disabled:text-text-muted"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {refundId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setRefundId(null)}>
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b p-5">
              <h2 className="font-bold">Process Refund</h2>
              <p className="text-xs text-text-muted mt-0.5">Transaction: {refundId.slice(0, 8)}…</p>
            </div>
            <div className="p-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Refund Reason</span>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for refund…"
                  className="w-full resize-none rounded-xl border border-border bg-gray-50 p-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t p-5">
              <button
                onClick={() => setRefundId(null)}
                className="rounded-xl border border-border py-3 text-sm font-bold text-text-primary"
              >
                Cancel
              </button>
              <button
                disabled={doRefund.isPending || !refundReason.trim()}
                onClick={() => doRefund.mutate()}
                className="rounded-xl bg-purple-600 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
