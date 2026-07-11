import { CreditCard, Landmark, Smartphone, Wallet } from 'lucide-react';
import { PaymentMethod } from '@/types/transaction.types';
import { cn } from '@/components/ui/utils';
import { formatBDT } from '@/utils/format';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onClick: () => void;
  balance?: number;
  isDisabled?: boolean;
}

const meta: Record<PaymentMethod, { name: string; subtitle: string; icon: typeof Wallet }> = {
  WALLET: { name: 'TollBD ওয়ালেট', subtitle: 'তাৎক্ষণিক পেমেন্ট', icon: Wallet },
  SSLCOMMERZ: { name: 'SSLCommerz', subtitle: 'কার্ড / নেট ব্যাংকিং', icon: Landmark },
  BKASH: { name: 'bKash', subtitle: 'মোবাইল ব্যাংকিং', icon: Smartphone },
  NAGAD: { name: 'Nagad', subtitle: 'মোবাইল ব্যাংকিং', icon: Smartphone },
  CARD: { name: 'Card', subtitle: 'ডেবিট / ক্রেডিট কার্ড', icon: CreditCard }
};

export const PaymentMethodCard = ({ method, isSelected, onClick, balance, isDisabled }: PaymentMethodCardProps) => {
  const item = meta[method];
  const Icon = item.icon;
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left transition',
        isSelected ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border/60',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'active:scale-[0.98] hover:border-border'
      )}
    >
      <span className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
        isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
      )}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bengali text-sm font-bold text-text-primary">{item.name}</span>
        <span className="block text-xs text-text-muted">
          {method === 'WALLET' && balance !== undefined ? `ব্যালেন্স: ${formatBDT(balance)}` : item.subtitle}
        </span>
      </span>
      <span className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
        isSelected ? 'border-primary bg-primary' : 'border-border'
      )}>
        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
};

