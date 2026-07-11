import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/components/ui/utils';

interface AppBarProps {
  title: string;
  titleBn?: string;
  subtitle?: string;
  showBack?: boolean;
  actions?: ReactNode;
  transparent?: boolean;
  colored?: boolean;
}

export const AppBar = ({ title, titleBn, subtitle, showBack, actions, transparent, colored }: AppBarProps) => {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex min-h-[56px] items-center gap-3 px-4',
        'pt-[env(safe-area-inset-top)]',
        colored
          ? 'bg-primary text-white'
          : transparent
          ? 'bg-transparent'
          : 'border-b border-border/50 bg-surface/95 text-text-primary backdrop-blur-xl'
      )}
    >
      {showBack && (
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-95',
            colored ? 'bg-white/15 hover:bg-white/25' : 'bg-bg hover:bg-border/60'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1 py-3">
        <h1 className={cn('truncate text-[15px] font-bold leading-tight', titleBn ? 'font-bengali' : '')}>
          {titleBn ?? title}
        </h1>
        {subtitle && (
          <p className={cn('mt-0.5 truncate text-xs', colored ? 'text-white/70' : 'text-text-secondary')}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
};

