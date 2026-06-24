import { cn } from '@/components/ui/utils';
import { formatBDT } from '@/utils/format';

interface AmountDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colored?: boolean;
  bn?: boolean;
  className?: string;
}

export const AmountDisplay = ({ amount, size = 'md', colored, bn, className }: AmountDisplayProps) => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <span className={cn('font-bold tracking-normal', sizes[size], colored ? 'text-primary' : 'text-text-primary', className)}>
      {formatBDT(amount, bn)}
    </span>
  );
};

