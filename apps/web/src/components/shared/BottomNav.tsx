import { Clock, Home, QrCode, ReceiptText, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/components/ui/utils';

const tabs = [
  { path: '/home', label: 'হোম', icon: Home },
  { path: '/history', label: 'ইতিহাস', icon: Clock },
  { path: '/toll/select-bridge', label: 'টোল', icon: ReceiptText, pay: true },
  { path: '/qr', label: 'QR', icon: QrCode },
  { path: '/profile', label: 'প্রোফাইল', icon: User },
];

export const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/home'
      ? location.pathname === '/home'
      : location.pathname.startsWith('/' + path.split('/')[1]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg border-t border-border/60 bg-surface/95 px-2 shadow-[0_-4px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="grid h-16 grid-cols-5 items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);

            if (tab.pay) {
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className="relative flex h-16 flex-col items-center justify-end gap-0.5 pb-1.5"
                >
                  <span className="absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/40 ring-4 ring-surface">
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                  <span className="font-bengali text-[10px] font-bold text-primary">{tab.label}</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex h-16 flex-col items-center justify-center gap-1"
              >
                <span className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200',
                  active ? 'bg-primary/10' : ''
                )}>
                  <Icon className={cn('h-5 w-5 transition-colors', active ? 'text-primary' : 'text-text-muted')} />
                </span>
                <span className={cn('font-bengali text-[10px] font-semibold transition-colors', active ? 'text-primary' : 'text-text-muted')}>
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

