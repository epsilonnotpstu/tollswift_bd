import { ArrowDownLeft, ArrowUpRight, ReceiptText, RotateCcw } from 'lucide-react';
import { WalletTransaction, Transaction } from '@/types/transaction.types';
import { cn } from '@/components/ui/utils';
import { formatBDT, formatDateTime } from '@/utils/format';
import { StatusBadge } from './StatusBadge';

interface TransactionRowProps {
  transaction: Transaction | WalletTransaction;
  onTap?: () => void;
}

const isWalletTx = (tx: Transaction | WalletTransaction): tx is WalletTransaction => 'walletId' in tx;

export const TransactionRow = ({ transaction, onTap }: TransactionRowProps) => {
  const wallet = isWalletTx(transaction);
  const debit = wallet ? transaction.type === 'DEBIT' : transaction.type === 'TOLL_PAYMENT';
  const Icon = wallet ? (debit ? ArrowUpRight : ArrowDownLeft) : transaction.status === 'REFUNDED' ? RotateCcw : ReceiptText;

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center gap-3 border-b border-border/50 bg-surface px-4 py-3.5 text-left transition last:border-b-0 active:bg-bg/60"
    >
      <span className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
        debit ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
      )}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {wallet ? transaction.description : transaction.bridgeName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-text-muted">
          {wallet ? formatDateTime(transaction.createdAt) : `${transaction.vehiclePlate} · ${formatDateTime(transaction.createdAt)}`}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className={cn('block text-sm font-bold tabular-nums', debit ? 'text-red-500' : 'text-emerald-600')}>
          {debit ? '−' : '+'}{formatBDT(transaction.amount)}
        </span>
        {!wallet && <StatusBadge status={transaction.status} size="sm" />}
      </span>
    </button>
  );
};

