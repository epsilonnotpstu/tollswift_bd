import { ReactNode, useState } from "react";
import {
  LayoutDashboard, Users, Car, Landmark, CreditCard, RefreshCw,
  BarChart3, QrCode, Megaphone, Settings, LogOut, Bell, Search, ChevronRight,
  TrendingUp, TrendingDown, Menu, X
} from "lucide-react";

type AdminPage = "dashboard" | "users" | "vehicles" | "bridges" | "transactions" | "qrscanner" | "announcements" | "settings";

const navGroups = [
  {
    title: "Overview",
    items: [{ id: "dashboard" as AdminPage, icon: LayoutDashboard, label: "ড্যাশবোর্ড" }],
  },
  {
    title: "Management",
    items: [
      { id: "users" as AdminPage, icon: Users, label: "ব্যবহারকারী" },
      { id: "vehicles" as AdminPage, icon: Car, label: "যানবাহন" },
      { id: "bridges" as AdminPage, icon: Landmark, label: "সেতু" },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "transactions" as AdminPage, icon: CreditCard, label: "লেনদেন" },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "qrscanner" as AdminPage, icon: QrCode, label: "QR স্ক্যানার" },
      { id: "announcements" as AdminPage, icon: Megaphone, label: "ঘোষণা" },
    ],
  },
];

interface AdminLayoutProps {
  children: (page: AdminPage, navigate: (p: AdminPage) => void) => ReactNode;
  onLogout: () => void;
}

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle: Record<AdminPage, string> = {
    dashboard: "ড্যাশবোর্ড",
    users: "ব্যবহারকারী ব্যবস্থাপনা",
    vehicles: "যানবাহন যাচাই",
    bridges: "সেতু ও টোল হার",
    transactions: "লেনদেন লগ",
    qrscanner: "টোল গেট স্ক্যানার",
    announcements: "ঘোষণা",
    settings: "সেটিংস",
  };

  return (
    <div className="flex h-full bg-[#F8F9FD]">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E4E9F5] flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E4E9F5]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#1B4FDB] rounded-xl flex items-center justify-center text-xl">🌉</div>
            <div>
              <div className="font-bold text-[#0F1729] text-sm">TollBD</div>
              <div className="text-[10px] text-[#8A97B5]">প্রশাসক প্যানেল</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="text-[10px] font-semibold text-[#8A97B5] uppercase tracking-widest px-3 mb-2">{group.title}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 relative transition-all ${active ? "bg-[#EEF2FF] text-[#1B4FDB]" : "text-[#5C6B8A] hover:bg-[#F0F3FA]"}`}
                  >
                    {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#1B4FDB] rounded-r-full" />}
                    <Icon size={18} className={active ? "text-[#1B4FDB]" : "text-[#5C6B8A]"} />
                    <span className="text-sm font-medium font-['Hind_Siliguri']">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-3 py-4 border-t border-[#E4E9F5]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-9 h-9 bg-[#1B4FDB] rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0F1729] text-sm truncate">Admin</p>
              <p className="text-xs text-[#8A97B5] truncate">admin@tollbd.gov.bd</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[#C62828] hover:bg-[#FFEBEE] rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium font-['Hind_Siliguri']">লগ আউট</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-[#E4E9F5] flex items-center px-5 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1">
            <Menu size={20} className="text-[#5C6B8A]" />
          </button>
          <h2 className="font-bold text-[#0F1729] flex-1 font-['Hind_Siliguri'] text-base">{pageTitle[currentPage]}</h2>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 bg-[#F0F3FA] rounded-full flex items-center justify-center">
              <Bell size={16} className="text-[#5C6B8A]" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#C62828] rounded-full" />
            </button>
            <div className="w-9 h-9 bg-[#1B4FDB] rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {children(currentPage, setCurrentPage)}
        </main>
      </div>
    </div>
  );
}
