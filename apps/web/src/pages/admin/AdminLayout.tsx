import { useState } from 'react';
import {
  Activity, Bell, Bike, Building2, ChevronLeft, ChevronRight,
  LayoutDashboard, LogOut, Menu, QrCode, ReceiptText, Users, X
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelBn: 'ড্যাশবোর্ড' },
  { to: '/admin/vehicles', icon: Bike, label: 'Vehicles', labelBn: 'যানবাহন' },
  { to: '/admin/users', icon: Users, label: 'Users', labelBn: 'ব্যবহারকারী' },
  { to: '/admin/bridges', icon: Building2, label: 'Bridges', labelBn: 'সেতু' },
  { to: '/admin/transactions', icon: ReceiptText, label: 'Transactions', labelBn: 'লেনদেন' },
  { to: '/admin/scanner', icon: QrCode, label: 'QR Scanner', labelBn: 'QR স্ক্যানার' },
  { to: '/admin/announcements', icon: Bell, label: 'Announcements', labelBn: 'ঘোষণা' },
];

const PAGE_TITLES: Record<string, { en: string; bn: string }> = {
  '/admin/dashboard': { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  '/admin/vehicles': { en: 'Vehicle Management', bn: 'যানবাহন ব্যবস্থাপনা' },
  '/admin/users': { en: 'User Management', bn: 'ব্যবহারকারী ব্যবস্থাপনা' },
  '/admin/bridges': { en: 'Bridge & Toll Rates', bn: 'সেতু ও টোল হার' },
  '/admin/transactions': { en: 'Transactions', bn: 'লেনদেন' },
  '/admin/scanner': { en: 'QR Gate Scanner', bn: 'QR গেট স্ক্যানার' },
  '/admin/announcements': { en: 'Announcements', bn: 'ঘোষণা' },
};

export const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) => location.pathname.startsWith(path))?.[1]
    ?? { en: 'Admin', bn: 'অ্যাডমিন' };

  const handleLogout = () => logout().then(() => navigate('/admin/login', { replace: true }));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={`flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-4 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/80">
          <Activity className="h-4 w-4 text-white" />
        </div>
        {!collapsed && <span className="text-[15px] font-bold text-white">TollBD Admin</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/55 hover:bg-white/8 hover:text-white/90'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="shrink-0 border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/30 text-xs font-bold text-white">
              {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.fullName ?? 'Admin'}</p>
              <p className="truncate text-[10px] text-white/40">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-white/40 transition hover:text-red-400" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/10 hover:text-red-400" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6FB]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-shrink-0 bg-[#0F1B3D] transition-all duration-300 lg:flex lg:flex-col ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#0F1B3D]">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="text-gray-500 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 lg:flex"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{pageTitle.en}</h1>
              <p className="font-bengali text-xs text-gray-400 leading-none">{pageTitle.bn}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span className="hidden text-xs font-semibold text-gray-700 sm:block">{user?.fullName ?? 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
