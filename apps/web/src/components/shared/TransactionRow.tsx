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
    <button type="button" onClick={onTap} className="flex w-full items-center gap-3 border-b border-border bg-surface p-4 text-left last:border-b-0">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', debit ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">{wallet ? transaction.description : transaction.bridgeName}</span>
        <span className="mt-0.5 block truncate text-xs text-text-secondary">
          {wallet ? formatDateTime(transaction.createdAt) : `${transaction.vehiclePlate} · ${formatDateTime(transaction.createdAt)}`}
        </span>
      </span>
      <span className="text-right">
        <span className={cn('block text-sm font-bold', debit ? 'text-red-600' : 'text-green-600')}>
          {debit ? '-' : '+'}{formatBDT(transaction.amount)}
        </span>
        {!wallet ? <StatusBadge status={transaction.status} size="sm" /> : null}
      </span>
    </button>
  );
};

