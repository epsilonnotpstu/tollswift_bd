import { cn } from '@/components/ui/utils';

interface StatusBadgeProps {
  status: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

const labels: Record<string, string> = {
  ACTIVE: 'সক্রিয়',
  BLOCKED: 'ব্লকড',
  UNVERIFIED: 'যাচাই বাকি',
  PENDING: 'অপেক্ষায়',
  VERIFIED: 'অনুমোদিত',
  REJECTED: 'বাতিল',
  SUCCESS: 'সফল',
  FAILED: 'ব্যর্থ',
  REFUNDED: 'রিফান্ড',
  MAINTENANCE: 'রক্ষণাবেক্ষণ',
  CLOSED: 'বন্ধ'
};

const styles: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  VERIFIED: 'bg-green-50 text-green-700 border-green-200',
  SUCCESS: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  UNVERIFIED: 'bg-amber-50 text-amber-700 border-amber-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  BLOCKED: 'bg-red-50 text-red-700 border-red-200',
  CLOSED: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED: 'bg-blue-50 text-blue-700 border-blue-200'
};

export const StatusBadge = ({ status, children, size = 'md' }: StatusBadgeProps) => {
  const key = status.toUpperCase();
  return (
    <span className={cn('inline-flex items-center rounded-full border font-bengali font-semibold', size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs', styles[key] ?? 'border-border bg-bg text-text-secondary')}>
      {children ?? labels[key] ?? status}
    </span>
  );
};

