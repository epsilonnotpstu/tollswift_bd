import { useNavigate, useLocation } from 'react-router';
import { Home, QrCode, Car, Clock, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', labelbn: 'হোম', path: '/home' },
  { icon: QrCode, label: 'Pay', labelbn: 'পেমেন্ট', path: '/pay' },
  { icon: Car, label: 'Vehicles', labelbn: 'গাড়ি', path: '/vehicles' },
  { icon: Clock, label: 'History', labelbn: 'ইতিহাস', path: '/history' },
  { icon: User, label: 'Profile', labelbn: 'প্রোফাইল', path: '/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="flex items-center justify-around bg-white border-t border-gray-100 pb-4 pt-2"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path === '/pay' && location.pathname.startsWith('/pay'));
        const Icon = item.icon;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
          >
            {/* Active indicator pill */}
            {isActive && (
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all"
                style={{ width: '24px', background: '#006A4E' }}
              />
            )}
            <div
              className="p-1.5 rounded-xl transition-all"
              style={{
                background: isActive ? '#E8F5F1' : 'transparent',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ color: isActive ? '#006A4E' : '#9CA3AF' }}
              />
            </div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#006A4E' : '#9CA3AF',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
