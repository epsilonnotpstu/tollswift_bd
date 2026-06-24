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
        'sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b px-4',
        'pt-[env(safe-area-inset-top)]',
        colored ? 'border-primary bg-primary text-white' : transparent ? 'border-transparent bg-transparent' : 'border-border bg-surface text-text-primary'
      )}
    >
      {showBack ? (
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className={cn('flex h-10 w-10 items-center justify-center rounded-full', colored ? 'bg-white/15' : 'bg-bg')}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      ) : null}
      <div className="min-w-0 flex-1 py-2">
        <h1 className={cn('truncate text-base font-bold', titleBn ? 'font-bengali' : '')}>{titleBn ?? title}</h1>
        {subtitle ? <p className={cn('truncate text-xs', colored ? 'text-white/75' : 'text-text-secondary')}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
};

