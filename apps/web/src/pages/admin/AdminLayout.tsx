import { ReactNode } from 'react';
import { Activity, Bell, Bike, Building2, LayoutDashboard, LogOut, ReceiptText, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const nav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/vehicles', icon: Bike, label: 'Vehicles' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/bridges', icon: Building2, label: 'Bridges' },
  { to: '/admin/transactions', icon: ReceiptText, label: 'Transactions' },
  { to: '/admin/announcements', icon: Bell, label: 'Announcements' },
];

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#F0F2F8]">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#0f1b3d] lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-white/10">
          <Activity className="h-6 w-6 text-[#4d8bff]" />
          <span className="text-base font-bold text-white">TollBD Admin</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 pt-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/55 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4d8bff]/20 text-xs font-bold text-[#4d8bff]">
              {user?.fullName?.[0] ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.fullName ?? 'Admin'}</p>
              <p className="truncate text-[10px] text-white/40">{user?.email}</p>
            </div>
            <button
              onClick={() => logout().then(() => navigate('/admin/login', { replace: true }))}
              className="text-white/40 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white bg-white px-6 shadow-sm lg:hidden">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold text-text-primary">TollBD Admin</span>
          </div>
          <button
            onClick={() => logout().then(() => navigate('/admin/login', { replace: true }))}
            className="flex items-center gap-1.5 text-sm text-red-600"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </header>
        <div className="flex gap-1.5 overflow-x-auto border-b border-gray-200 bg-white px-4 py-1.5 lg:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-text-muted'
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
