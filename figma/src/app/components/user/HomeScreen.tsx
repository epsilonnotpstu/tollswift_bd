import { Bell, Eye, EyeOff, Plus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { TransactionRow } from "../ui/TollBDComponents";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  const recentTrips = [
    { type: "toll" as const, title: "পদ্মা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ২৩ জুন, ১১:৩২", amount: "১,৫০০", isDebit: true, status: "সফল" },
    { type: "deposit" as const, title: "ওয়ালেট রিচার্জ", subtitle: "bKash • ২২ জুন, ০৯:১৫", amount: "৫,০০০", isDebit: false, status: "সফল" },
    { type: "toll" as const, title: "মেঘনা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ২১ জুন, ১৭:৪৫", amount: "৩০০", isDebit: true, status: "সফল" },
  ];

  const quickActions = [
    { icon: "🛣️", label: "টোল দিন", screen: "pay", color: "#EEF2FF" },
    { icon: "📲", label: "QR দেখান", screen: "qr", color: "#E6FBF2" },
    { icon: "🚗", label: "গাড়ি যোগ", screen: "vehicles", color: "#FFF8E8" },
    { icon: "📋", label: "ইতিহাস", screen: "history", color: "#F3E8FF" },
  ];

  const popularBridges = [
    { name: "পদ্মা সেতু", location: "মাওয়া-জাজিরা", toll: "১,৫০০" },
    { name: "মেঘনা সেতু", location: "মেঘনা", toll: "৩০০" },
    { name: "যমুনা সেতু", location: "সিরাজগঞ্জ", toll: "৮৫০" },
    { name: "রূপসা সেতু", location: "খুলনা", toll: "১৫০" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-[#1B4FDB] px-5 pt-12 pb-8 relative overflow-hidden" style={{ borderRadius: "0 0 28px 28px" }}>
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5" />

        {/* Top row */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div>
            <p className="text-white/70 text-xs">শুভ সকাল</p>
            <h3 className="text-white text-lg font-semibold font-['Hind_Siliguri']">রহিম সাহেব 👋</h3>
          </div>
          <button className="relative w-10 h-10 bg-white/15 rounded-full flex items-center justify-center">
            <Bell size={18} className="text-white" />
            <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-[#F5A623] rounded-full border border-[#1B4FDB]" />
          </button>
        </div>

        {/* Balance card */}
        <div className="bg-white rounded-2xl p-4 shadow-lg relative z-10">
          <p className="text-xs text-[#5C6B8A] font-['Hind_Siliguri']">আপনার ওয়ালেট ব্যালেন্স</p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#0F1729]">
                {balanceVisible ? "৳ ১২,৩৪০.৫০" : "৳ ••••••"}
              </span>
              <button onClick={() => setBalanceVisible(!balanceVisible)}>
                {balanceVisible ? <Eye size={16} className="text-[#8A97B5]" /> : <EyeOff size={16} className="text-[#8A97B5]" />}
              </button>
            </div>
          </div>
          <button
            onClick={() => onNavigate("addmoney")}
            className="mt-3 bg-[#00A86B] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 w-fit active:scale-95 transition-transform"
          >
            <Plus size={14} /> ৳ টাকা যোগ করুন
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.screen}
              onClick={() => onNavigate(action.screen)}
              className="flex flex-col items-center gap-2 bg-white rounded-2xl py-4 shadow-sm border border-[#E4E9F5] active:scale-95 transition-transform"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{ background: action.color }}
              >
                {action.icon}
              </div>
              <span className="text-[10px] font-medium text-[#2D3A55] text-center leading-tight font-['Hind_Siliguri']">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Announcement banner */}
      <div className="mx-5 mt-4">
        <div className="bg-[#E3F2FD] border-l-4 border-[#1565C0] rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">📢</span>
          <div>
            <p className="text-xs font-semibold text-[#01315F]">পদ্মা সেতুতে নতুন টোল হার কার্যকর</p>
            <p className="text-[10px] text-[#01315F]/70 mt-0.5">১ জুলাই, ২০২৬ থেকে কার্যকর হবে</p>
          </div>
        </div>
      </div>

      {/* Recent trips */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[#0F1729] text-sm font-['Hind_Siliguri']">সাম্প্রতিক ট্রিপ</h4>
          <button onClick={() => onNavigate("history")} className="text-xs text-[#1B4FDB] flex items-center gap-1">
            সব দেখুন <ArrowRight size={12} />
          </button>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E4E9F5]">
          {recentTrips.map((tx, i) => (
            <TransactionRow
              key={i}
              {...tx}
              onClick={() => onNavigate("receipt")}
            />
          ))}
        </div>
      </div>

      {/* Popular bridges */}
      <div className="mt-5 pb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h4 className="font-semibold text-[#0F1729] text-sm font-['Hind_Siliguri']">জনপ্রিয় সেতু</h4>
          <button onClick={() => onNavigate("pay")} className="text-xs text-[#1B4FDB] flex items-center gap-1">
            সব দেখুন <ArrowRight size={12} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2 no-scrollbar">
          {popularBridges.map((bridge) => (
            <button
              key={bridge.name}
              onClick={() => onNavigate("pay")}
              className="flex-shrink-0 w-40 bg-white rounded-2xl p-4 shadow-sm border border-[#E4E9F5] text-left active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#EEF2FF] to-[#C7D4FF] rounded-xl flex items-center justify-center text-2xl mb-3">🌉</div>
              <p className="font-semibold text-xs text-[#0F1729] font-['Hind_Siliguri']">{bridge.name}</p>
              <p className="text-[10px] text-[#8A97B5] mt-0.5 flex items-center gap-1">📍{bridge.location}</p>
              <p className="text-xs text-[#1B4FDB] font-semibold mt-2">৳{bridge.toll}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
