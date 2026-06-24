import { Clock, Home, QrCode, ReceiptText, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/components/ui/utils';

const tabs = [
  { path: '/home', label: 'হোম', icon: Home },
  { path: '/toll/select-bridge', label: 'টোল', icon: ReceiptText, pay: true },
  { path: '/qr', label: 'QR', icon: QrCode },
  { path: '/history', label: 'ইতিহাস', icon: Clock },
  { path: '/profile', label: 'প্রোফাইল', icon: User }
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-[calc(64px+env(safe-area-inset-bottom))] border-t border-border bg-surface px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,41,0.06)]">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.path === '/home' ? location.pathname === '/home' : location.pathname.startsWith(tab.path.split('/')[1] ? `/${tab.path.split('/')[1]}` : tab.path);

          if (tab.pay) {
            return (
              <NavLink key={tab.path} to={tab.path} className="flex h-16 flex-col items-center justify-end gap-1 pb-1 text-[10px] font-medium text-text-muted">
                <span className="absolute -mt-12 flex h-[52px] w-[52px] -translate-y-3 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-bengali">{tab.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink key={tab.path} to={tab.path} className="relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium">
              <span className={cn('h-1 w-5 rounded-b-full', active ? 'bg-primary' : 'bg-transparent')} />
              <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-text-muted')} />
              <span className={cn('font-bengali', active ? 'text-primary' : 'text-text-muted')}>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

