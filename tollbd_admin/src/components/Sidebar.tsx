import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Road,
  Users,
  Car,
  AlertTriangle,
  LineChart,
  Settings,
  LogOut,
} from 'lucide-react'

type SidebarProps = {
  adminName?: string
  pendingVehicles?: number
  openDisputes?: number
  onLogout: () => void
}

const navItems = [
  { to: '/', label: 'ওভারভিউ', icon: LayoutDashboard, key: 'overview' },
  { to: '/gates', label: 'টোল গেট', icon: Road, key: 'gates' },
  { to: '/users', label: 'ব্যবহারকারী', icon: Users, key: 'users' },
  { to: '/vehicles', label: 'যানবাহন যাচাই', icon: Car, key: 'vehicles' },
  { to: '/disputes', label: 'বিরোধ', icon: AlertTriangle, key: 'disputes' },
  { to: '/analytics', label: 'বিশ্লেষণ', icon: LineChart, key: 'analytics' },
  { to: '/settings', label: 'সেটিংস', icon: Settings, key: 'settings' },
]

export function Sidebar({
  adminName,
  pendingVehicles = 0,
  openDisputes = 0,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 flex-col bg-[#004D38] text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-2xl font-black tracking-tight">TollBD</p>
        <p className="text-sm text-emerald-100">Admin Console</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const badge =
            item.key === 'vehicles'
              ? pendingVehicles
              : item.key === 'disputes'
                ? openDisputes
                : 0

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-[#004D38]'
                    : 'text-emerald-50 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 text-sm text-emerald-100">{adminName || 'Admin'}</div>
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
