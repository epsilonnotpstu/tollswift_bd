import { Eye, EyeOff, Plus, Download } from "lucide-react";
import { useState } from "react";
import { TransactionRow } from "../ui/TollBDComponents";

interface WalletScreenProps {
  onNavigate: (screen: string) => void;
}

export function WalletScreen({ onNavigate }: WalletScreenProps) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [filter, setFilter] = useState("সব");

  const filters = ["সব", "জমা", "খরচ"];
  const groups = [
    {
      date: "আজ — ২৩ জুন",
      items: [
        { type: "toll" as const, title: "পদ্মা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ১১:৩২", amount: "১,৫০০", isDebit: true, status: "সফল" },
      ],
    },
    {
      date: "গতকাল — ২২ জুন",
      items: [
        { type: "deposit" as const, title: "ওয়ালেট রিচার্জ", subtitle: "bKash • ০৯:১৫", amount: "৫,০০০", isDebit: false, status: "সফল" },
        { type: "toll" as const, title: "মেঘনা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ১৭:৪৫", amount: "৩০০", isDebit: true, status: "সফল" },
      ],
    },
    {
      date: "২০ জুন",
      items: [
        { type: "toll" as const, title: "যমুনা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ০৮:২০", amount: "৮৫০", isDebit: true, status: "সফল" },
        { type: "refund" as const, title: "রিফান্ড", subtitle: "লেনদেন #TX-৮৮৯ • ১৪:০০", amount: "১৫০", isDebit: false, status: "প্রক্রিয়া সম্পন্ন" },
        { type: "deposit" as const, title: "ওয়ালেট রিচার্জ", subtitle: "Nagad • ০৭:০০", amount: "২,০০০", isDebit: false, status: "সফল" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      {/* Header */}
      <div className="bg-[#1B4FDB] px-5 pt-12 pb-8 relative overflow-hidden" style={{ borderRadius: "0 0 28px 28px" }}>
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/5" />
        <h2 className="text-white font-bold text-lg mb-5 font-['Hind_Siliguri']">আমার ওয়ালেট</h2>

        <div className="text-center">
          <p className="text-white/70 text-xs">মোট ব্যালেন্স</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-3xl font-bold text-white">
              {balanceVisible ? "৳ ১২,৩৪০.৫০" : "৳ ••••••"}
            </span>
            <button onClick={() => setBalanceVisible(!balanceVisible)}>
              {balanceVisible ? <Eye size={18} className="text-white/70" /> : <EyeOff size={18} className="text-white/70" />}
            </button>
          </div>
          <button
            onClick={() => onNavigate("addmoney")}
            className="mt-4 bg-[#F5A623] text-[#8A5A00] text-sm font-bold px-6 py-2.5 rounded-full flex items-center gap-2 mx-auto active:scale-95 transition-transform"
          >
            <Plus size={16} /> টাকা যোগ করুন
          </button>
        </div>
      </div>

      {/* Month summary */}
      <div className="flex gap-3 px-5 mt-5">
        <div className="flex-1 bg-[#E6FBF2] rounded-xl p-3 text-center">
          <p className="text-xs text-[#006B44] font-['Hind_Siliguri']">এই মাসে জমা</p>
          <p className="font-bold text-[#00A86B] text-sm">+৳৫,০০০</p>
        </div>
        <div className="flex-1 bg-[#FFEBEE] rounded-xl p-3 text-center">
          <p className="text-xs text-[#7F0000] font-['Hind_Siliguri']">এই মাসে খরচ</p>
          <p className="font-bold text-[#C62828] text-sm">−৳৩,২৪০</p>
        </div>
      </div>

      {/* Filter row */}
      <div className="flex gap-2 px-5 mt-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-[#1B4FDB] text-white" : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="flex-1 px-5 mt-4 pb-6 space-y-4">
        {groups.map((group) => (
          <div key={group.date}>
            <p className="text-xs text-[#8A97B5] font-medium mb-2 uppercase tracking-wide">{group.date}</p>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E4E9F5]">
              {group.items.map((item, i) => (
                <TransactionRow
                  key={i}
                  {...item}
                  onClick={() => onNavigate("receipt")}
                />
              ))}
            </div>
          </div>
        ))}

        <button className="w-full text-[#1B4FDB] text-sm font-medium py-4 flex items-center justify-center gap-2 border border-[#C7D4FF] rounded-xl bg-[#EEF2FF]">
          <Download size={16} /> স্টেটমেন্ট ডাউনলোড
        </button>
      </div>
    </div>
  );
}

// Add Money Screen
interface AddMoneyScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}
export function AddMoneyScreen({ onBack, onSuccess }: AddMoneyScreenProps) {
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const presets = ["১০০", "২০০", "৫০০", "১,০০০", "২,০০০"];
  const methods = [
    { logo: "🔒", name: "SSLCommerz", subtitle: "কার্ড / নেট ব্যাংকিং" },
    { logo: "🔴", name: "bKash", subtitle: "মোবাইল ব্যাংকিং" },
    { logo: "🟠", name: "Nagad", subtitle: "মোবাইল ব্যাংকিং" },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center px-4 pt-12 pb-4 border-b border-[#E4E9F5]">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center mr-3">
          <span className="text-lg">←</span>
        </button>
        <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">টাকা যোগ করুন</h1>
      </div>

      <div className="flex-1 px-6 pt-6 pb-24 space-y-6">
        {/* Amount display */}
        <div className="text-center py-8 bg-[#F8F9FD] rounded-2xl">
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-[#0F1729]">৳</span>
            <input
              type="number"
              placeholder="০"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-4xl font-bold text-[#0F1729] bg-transparent border-none outline-none w-40 text-center"
              min="10"
              max="50000"
            />
          </div>
          <p className="text-xs text-[#8A97B5] mt-2">সর্বনিম্ন ৳১০ · সর্বোচ্চ ৳৫০,০০০</p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p.replace(",", ""))}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#EEF2FF] text-[#1B4FDB] border border-[#C7D4FF] hover:bg-[#1B4FDB] hover:text-white transition-colors"
            >
              ৳{p}
            </button>
          ))}
        </div>

        {/* Payment methods */}
        <div>
          <p className="text-sm font-semibold text-[#0F1729] mb-3 font-['Hind_Siliguri']">পেমেন্ট পদ্ধতি</p>
          <div className="space-y-3">
            {methods.map((m) => (
              <div
                key={m.name}
                onClick={() => setSelected(m.name)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selected === m.name ? "border-2 border-[#1B4FDB] bg-[#EEF2FF]" : "border border-[#E4E9F5] hover:border-[#C7D4FF]"}`}
              >
                <div className="w-10 h-10 bg-[#F0F3FA] rounded-lg flex items-center justify-center text-2xl">{m.logo}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#0F1729]">{m.name}</p>
                  <p className="text-xs text-[#8A97B5]">{m.subtitle}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${selected === m.name ? "border-[#1B4FDB] bg-[#1B4FDB]" : "border-[#C9D3E8]"}`}>
                  {selected === m.name && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E4E9F5]">
        <button
          onClick={onSuccess}
          disabled={!amount || !selected}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${amount && selected ? "bg-[#1B4FDB] text-white active:scale-95" : "bg-[#E4E9F5] text-[#8A97B5] cursor-not-allowed"}`}
        >
          এগিয়ে যান ৳{amount || "০"}
        </button>
      </div>
    </div>
  );
}
