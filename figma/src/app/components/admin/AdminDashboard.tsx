import { TrendingUp, TrendingDown, Users, CreditCard, AlertCircle, DollarSign, ArrowRight, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { KPICard, StatusBadge } from "../ui/TollBDComponents";

type AdminPage = "dashboard" | "users" | "vehicles" | "bridges" | "transactions" | "qrscanner" | "announcements" | "settings";

interface AdminDashboardProps {
  onNavigate: (page: AdminPage) => void;
}

const weeklyData = [
  { day: "সোম", amount: 38000 },
  { day: "মঙ্গল", amount: 42000 },
  { day: "বুধ", amount: 35000 },
  { day: "বৃহ", amount: 48000 },
  { day: "শুক্র", amount: 52000 },
  { day: "শনি", amount: 55000 },
  { day: "আজ", amount: 45230 },
];

const paymentMethods = [
  { name: "ওয়ালেট", value: 45, color: "#1B4FDB" },
  { name: "bKash", value: 25, color: "#E2136E" },
  { name: "Nagad", value: 20, color: "#E0232E" },
  { name: "Card", value: 10, color: "#5C6B8A" },
];

const recentTransactions = [
  { id: "TX-8847", user: "মোহাম্মদ রহিম", bridge: "পদ্মা সেতু", amount: "৳১,৫০০", method: "ওয়ালেট", status: "success" as const },
  { id: "TX-8846", user: "ফারিদা বেগম", bridge: "মেঘনা সেতু", amount: "৳৩০০", method: "bKash", status: "success" as const },
  { id: "TX-8845", user: "কামাল উদ্দিন", bridge: "যমুনা সেতু", amount: "৳৮৫০", method: "Nagad", status: "failed" as const },
  { id: "TX-8844", user: "সালমা আক্তার", bridge: "পদ্মা সেতু", amount: "৳১,৫০০", method: "ওয়ালেট", status: "success" as const },
  { id: "TX-8843", user: "নাসিম হাসান", bridge: "রূপসা সেতু", amount: "৳১৫০", method: "Card", status: "success" as const },
];

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Date chip */}
      <div className="flex items-center justify-between">
        <span className="text-xs bg-[#EEF2FF] text-[#1B4FDB] px-3 py-1.5 rounded-full font-medium">
          ২৩ জুন, ২০২৬ — সোমবার
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="আজকের আয়"
          value="৳ ৪৫,২৩০"
          trend="+১২% গতকালের চেয়ে"
          trendUp
          icon={<DollarSign size={18} />}
          accent="green"
        />
        <KPICard
          title="সক্রিয় ব্যবহারকারী"
          value="৮,৩৪২"
          trend="+৪৩ আজকে"
          trendUp
          icon={<Users size={18} />}
          accent="blue"
        />
        <KPICard
          title="মোট লেনদেন"
          value="১২৩"
          trend="আজকে"
          icon={<CreditCard size={18} />}
          accent="amber"
        />
        <KPICard
          title="অপেক্ষমান যাচাই"
          value="৭"
          trend="এখনই দেখুন →"
          icon={<AlertCircle size={18} />}
          accent="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly Revenue */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E9F5] p-5">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">সাপ্তাহিক আয়</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8A97B5]">জুন ১৭–২৩</span>
              <button className="text-xs text-[#1B4FDB] flex items-center gap-1">
                CSV <ArrowRight size={10} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8A97B5" }} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => [`৳${v.toLocaleString()}`, "আয়"]}
                contentStyle={{ borderRadius: 8, border: "1px solid #E4E9F5", fontSize: 12 }}
              />
              <Bar dataKey="amount" fill="#1B4FDB" radius={[6, 6, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i === weeklyData.length - 1 ? "#1B4FDB" : "#C7D4FF"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods Pie */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E9F5] p-5">
          <h4 className="font-semibold text-[#0F1729] mb-5 font-['Hind_Siliguri']">পেমেন্ট পদ্ধতি</h4>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={paymentMethods}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {paymentMethods.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, "শেয়ার"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {paymentMethods.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                  <span className="text-[#5C6B8A]">{m.name}</span>
                </div>
                <span className="font-medium text-[#0F1729]">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Transactions table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E9F5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E4E9F5] flex items-center justify-between">
            <h4 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">সাম্প্রতিক লেনদেন</h4>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs text-[#1B4FDB] flex items-center gap-1"
            >
              সব দেখুন <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FD]">
                  {["আইডি", "ব্যবহারকারী", "সেতু", "পরিমাণ", "পদ্ধতি", "স্ট্যাটাস"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-[#8A97B5] uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx, i) => (
                  <tr key={tx.id} className={`border-t border-[#F0F3FA] ${i % 2 === 1 ? "bg-[#F8F9FD]/50" : ""} hover:bg-[#EEF2FF]/30 cursor-pointer transition-colors`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#5C6B8A]">{tx.id}</td>
                    <td className="px-4 py-3 text-sm text-[#0F1729] font-medium font-['Hind_Siliguri'] whitespace-nowrap">{tx.user}</td>
                    <td className="px-4 py-3 text-sm text-[#5C6B8A] font-['Hind_Siliguri'] whitespace-nowrap">{tx.bridge}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F1729]">{tx.amount}</td>
                    <td className="px-4 py-3 text-xs text-[#5C6B8A]">{tx.method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} size="sm">
                        {tx.status === "success" ? "সফল" : "ব্যর্থ"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts panel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#FFEBEE] rounded-2xl border border-[#C62828]/20 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#C62828] rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#7F0000] text-sm font-['Hind_Siliguri']">৭ টি গাড়ি যাচাইয়ের অপেক্ষায়</p>
                <button onClick={() => onNavigate("vehicles")} className="text-xs text-[#C62828] mt-1 underline">এখনই দেখুন →</button>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF8E1] rounded-2xl border border-[#F9A825]/20 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#F9A825] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg">🌉</span>
              </div>
              <div>
                <p className="font-semibold text-[#4E3200] text-sm font-['Hind_Siliguri']">ভৈরব সেতু রক্ষণাবেক্ষণে</p>
                <p className="text-xs text-[#8A97B5] mt-0.5">আগামীকাল পুনরায় খুলবে</p>
              </div>
            </div>
          </div>

          <div className="bg-[#E3F2FD] rounded-2xl border border-[#1565C0]/20 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[#1565C0] rounded-xl flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#01315F] text-sm font-['Hind_Siliguri']">১৫ জন ব্যবহারকারীর ব্যালেন্স কম</p>
                <p className="text-xs text-[#01315F]/70 mt-0.5">৳১০০ এর নিচে</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-[#1B4FDB] text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            📢 ঘোষণা পাঠান
          </button>
        </div>
      </div>
    </div>
  );
}
