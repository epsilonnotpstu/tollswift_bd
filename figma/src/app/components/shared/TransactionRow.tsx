import { ArrowDownLeft, ArrowUpRight, RotateCcw, MapPin } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'toll' | 'deposit' | 'refund';
  gate: string;
  gatebn: string;
  amount: number;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  road?: string | null;
}

interface TransactionRowProps {
  transaction: Transaction;
  language?: 'en' | 'bn';
  onSwipeDispute?: () => void;
}

const typeConfig = {
  toll: {
    icon: ArrowUpRight,
    bg: '#FEF3F2',
    iconColor: '#EF4444',
    label: 'Toll',
    labelbn: 'টোল',
  },
  deposit: {
    icon: ArrowDownLeft,
    bg: '#ECFDF5',
    iconColor: '#10B981',
    label: 'Deposit',
    labelbn: 'জমা',
  },
  refund: {
    icon: RotateCcw,
    bg: '#EFF6FF',
    iconColor: '#3B82F6',
    label: 'Refund',
    labelbn: 'ফেরত',
  },
};

export function TransactionRow({ transaction, language = 'en' }: TransactionRowProps) {
  const config = typeConfig[transaction.type];
  const Icon = config.icon;

  const date = new Date(transaction.timestamp);
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const isDebit = transaction.amount < 0;
  const amountStr = `${isDebit ? '-' : '+'}৳${Math.abs(transaction.amount)}`;

  return (
    <div className="flex items-center gap-3 py-3 px-1">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: config.bg }}
      >
        <Icon size={18} style={{ color: config.iconColor }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          className="truncate"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1A1A2E',
          }}
        >
          {language === 'bn' ? transaction.gatebn : transaction.gate}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {transaction.road && (
            <>
              <MapPin size={9} style={{ color: '#9CA3AF' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>
                {transaction.road} ·{' '}
              </span>
            </>
          )}
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9CA3AF' }}>
            {dateStr}, {timeStr}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <div
          style={{
            fontFamily: 'Roboto Mono, monospace',
            fontSize: '14px',
            fontWeight: 700,
            color: isDebit ? '#EF4444' : '#10B981',
          }}
        >
          {amountStr}
        </div>
        <div
          className="mt-0.5"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            color: '#10B981',
          }}
        >
          {transaction.status}
        </div>
      </div>
    </div>
  );
}
