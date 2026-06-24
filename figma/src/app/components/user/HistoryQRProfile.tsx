import { useState } from "react";
import { Share2, Download, RefreshCw, ChevronLeft, ChevronRight, QrCode, Bell, Shield, Globe, LogOut, HelpCircle, Info } from "lucide-react";
import { TransactionRow, StatusBadge } from "../ui/TollBDComponents";

// History Screen
interface HistoryScreenProps {
  onNavigate: (screen: string) => void;
}
export function HistoryScreen({ onNavigate }: HistoryScreenProps) {
  const [filter, setFilter] = useState("সব");
  const filters = ["সব", "এই মাসে", "গত মাস"];

  const allTransactions = [
    { type: "toll" as const, title: "পদ্মা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ২৩ জুন, ১১:৩২", amount: "১,৫০০", isDebit: true, status: "সফল" },
    { type: "deposit" as const, title: "ওয়ালেট রিচার্জ", subtitle: "bKash • ২২ জুন, ০৯:১৫", amount: "৫,০০০", isDebit: false, status: "সফল" },
    { type: "toll" as const, title: "মেঘনা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ২১ জুন, ১৭:৪৫", amount: "৩০০", isDebit: true, status: "সফল" },
    { type: "toll" as const, title: "যমুনা সেতু", subtitle: "গাড়ি • ঢাকা-৩৪৫৬ • ২০ জুন, ০৮:২০", amount: "৮৫০", isDebit: true, status: "সফল" },
    { type: "refund" as const, title: "রিফান্ড", subtitle: "লেনদেন #TX-৮৮৯ • ১৯ জুন", amount: "১৫০", isDebit: false, status: "সম্পন্ন" },
    { type: "deposit" as const, title: "ওয়ালেট রিচার্জ", subtitle: "Nagad • ১৮ জুন", amount: "২,০০০", isDebit: false, status: "সফল" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5]">
        <h1 className="font-bold text-[#0F1729] text-lg mb-4 font-['Hind_Siliguri']">পেমেন্ট ইতিহাস</h1>

        {/* Month summary */}
        <div className="bg-[#FFF8E8] border border-[#F5A623]/30 rounded-xl px-4 py-3 mb-4">
          <p className="font-semibold text-[#0F1729] text-sm font-['Hind_Siliguri']">এই মাসে মোট খরচ: <span className="text-[#F5A623]">৳ ৩,২৪০</span></p>
          <p className="text-xs text-[#8A97B5] mt-0.5">৬ টি লেনদেন</p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-[#1B4FDB] text-white" : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-4 pb-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E4E9F5]">
          {allTransactions.map((tx, i) => (
            <TransactionRow
              key={i}
              {...tx}
              onClick={() => onNavigate("receipt")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Receipt Screen
interface ReceiptScreenProps {
  onBack: () => void;
}
export function ReceiptScreen({ onBack }: ReceiptScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      {/* App bar */}
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">রসিদ</h1>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 bg-[#F0F3FA] rounded-full flex items-center justify-center"><Share2 size={16} /></button>
          <button className="w-9 h-9 bg-[#F0F3FA] rounded-full flex items-center justify-center"><Download size={16} /></button>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 pb-8">
        {/* Receipt document */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E4E9F5]">
          {/* Header band */}
          <div className="bg-[#1B4FDB] px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center text-xl">🌉</div>
                <span className="text-white font-bold text-sm">TollBD</span>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm font-['Hind_Siliguri']">সেতু টোল রসিদ</p>
                <p className="text-white/70 text-xs">Bangladesh Bridge Authority</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            {/* Receipt header info */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-[#8A97B5] font-['Hind_Siliguri']">রসিদ নম্বর</p>
                <p className="font-mono font-bold text-sm text-[#0F1729]">TX-2026-06-23-8847</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#8A97B5]">তারিখ ও সময়</p>
                <p className="text-xs text-[#0F1729]">২৩ জুন, ২০২৬ — ১১:৩২</p>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <StatusBadge status="success">সফলভাবে পরিশোধিত</StatusBadge>
            </div>

            {/* Dotted divider */}
            <div className="border-t-2 border-dashed border-[#E4E9F5] my-4" />

            {/* Table rows */}
            {[
              { label: "সেতুর নাম", value: "পদ্মা সেতু" },
              { label: "যানবাহন নম্বর", value: "ঢাকা মেট্রো-ক ৩৪-৫৬" },
              { label: "ধরন", value: "গাড়ি (Category B)" },
              { label: "পেমেন্ট পদ্ধতি", value: "TollBD ওয়ালেট" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm py-2.5 border-b border-[#F8F9FD]">
                <span className="text-[#5C6B8A] font-['Hind_Siliguri']">{row.label}</span>
                <span className="text-[#0F1729] font-medium">{row.value}</span>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center mt-4 bg-[#E6FBF2] rounded-xl px-4 py-3">
              <span className="font-bold text-[#00A86B] font-['Hind_Siliguri']">পরিশোধিত পরিমাণ</span>
              <span className="text-2xl font-bold text-[#00A86B]">৳ ১,৫০০</span>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center mt-5 mb-2">
              <div className="w-36 h-36 bg-[#F0F3FA] rounded-xl flex items-center justify-center border border-[#E4E9F5]">
                <QrCode size={80} className="text-[#0F1729]" />
              </div>
              <p className="text-xs text-[#8A97B5] mt-2 font-['Hind_Siliguri']">স্ক্যান করে যাচাই করুন</p>
            </div>

            <p className="text-[10px] text-[#8A97B5] text-center mt-4 font-['Hind_Siliguri']">
              TollBD • support@tollbd.gov.bd • 16XXX
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// QR Screen
interface QRScreenProps {
  onNavigate: (screen: string) => void;
}
export function QRScreen({ onNavigate }: QRScreenProps) {
  const [selectedVehicle, setSelectedVehicle] = useState("ঢাকা মেট্রো-ক ৩৪-৫৬");
  const vehicles = ["ঢাকা মেট্রো-ক ৩৪-৫৬", "ঢাকা মেট্রো-ক ৭৮-৯০"];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5] flex items-center justify-between">
        <h1 className="font-bold text-[#0F1729] text-lg font-['Hind_Siliguri']">QR FastPass</h1>
        <button className="w-9 h-9 bg-[#F0F3FA] rounded-full flex items-center justify-center">
          <RefreshCw size={16} className="text-[#5C6B8A]" />
        </button>
      </div>

      {/* Vehicle chips */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto">
        {vehicles.map((v) => (
          <button
            key={v}
            onClick={() => setSelectedVehicle(v)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium font-mono transition-all ${selectedVehicle === v ? "bg-[#1B4FDB] text-white" : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* QR Card */}
      <div className="mx-5 mt-4 bg-white rounded-2xl shadow-md border border-[#E4E9F5] p-5">
        <p className="text-sm text-[#5C6B8A] text-center mb-4 font-['Hind_Siliguri']">গেটে এই QR দেখান</p>

        {/* QR Code display */}
        <div className="flex justify-center mb-4">
          <div className="w-56 h-56 bg-[#F0F3FA] rounded-2xl flex items-center justify-center border-2 border-[#E4E9F5] relative">
            <QrCode size={140} className="text-[#1B4FDB]" />
            {/* Corner marks */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#1B4FDB] rounded-tl-sm" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#1B4FDB] rounded-tr-sm" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#1B4FDB] rounded-bl-sm" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#1B4FDB] rounded-br-sm" />
          </div>
        </div>

        <p className="text-center font-mono font-bold text-[#0F1729] text-sm">{selectedVehicle}</p>
        <p className="text-center text-xs text-[#8A97B5] mt-1">গাড়ি (Category B)</p>
        <p className="text-center text-xs text-[#8A97B5] mt-2 font-['Hind_Siliguri']">মেয়াদ শেষ: আগামীকাল দুপুর ১২টা</p>

        <button className="w-full mt-4 border border-[#C7D4FF] text-[#1B4FDB] py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <RefreshCw size={14} /> নতুন QR তৈরি করুন
        </button>
      </div>

      {/* Share */}
      <div className="mx-5 mt-3">
        <button className="w-full bg-[#00A86B] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform font-['Hind_Siliguri']">
          <Share2 size={16} /> QR শেয়ার করুন
        </button>
      </div>

      {/* Instructions */}
      <div className="mx-5 mt-4 space-y-2 pb-6">
        {[
          { step: "১", text: "টোল গেটে পৌঁছান" },
          { step: "২", text: "স্ক্যানারে QR কোড ধরুন" },
          { step: "৩", text: "সবুজ আলো দেখলে এগিয়ে যান" },
        ].map((inst) => (
          <div key={inst.step} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-[#E4E9F5]">
            <div className="w-7 h-7 bg-[#EEF2FF] rounded-full flex items-center justify-center text-xs font-bold text-[#1B4FDB] flex-shrink-0">{inst.step}</div>
            <p className="text-sm text-[#2D3A55] font-['Hind_Siliguri']">{inst.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile Screen
interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}
export function ProfileScreen({ onNavigate, onLogout }: ProfileScreenProps) {
  const menuGroups = [
    {
      title: "অ্যাকাউন্ট",
      items: [
        { icon: "👤", label: "প্রোফাইল সম্পাদনা", screen: "edit-profile" },
        { icon: "🚗", label: "আমার গাড়ি", screen: "vehicles" },
        { icon: "💳", label: "পেমেন্ট পদ্ধতি", screen: "payment-methods" },
      ],
    },
    {
      title: "অ্যাপ",
      items: [
        { icon: "🔔", label: "নোটিফিকেশন", screen: "notifications" },
        { icon: "🔒", label: "নিরাপত্তা", screen: "security" },
        { icon: "🌐", label: "ভাষা", screen: "language" },
      ],
    },
    {
      title: "সাহায্য",
      items: [
        { icon: "❓", label: "সাহায্য ও সহায়তা", screen: "help" },
        { icon: "ℹ️", label: "অ্যাপ সম্পর্কে", screen: "about" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      {/* Profile hero */}
      <div className="bg-[#1B4FDB] px-5 pt-12 pb-10 relative overflow-hidden" style={{ borderRadius: "0 0 32px 32px" }}>
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/5" />
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl border-4 border-white/30">👤</div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#F5A623] rounded-full flex items-center justify-center text-xs border-2 border-white">✏️</button>
          </div>
          <h3 className="text-white font-bold text-lg font-['Hind_Siliguri']">মোহাম্মদ রহিম</h3>
          <p className="text-white/70 text-sm mt-0.5">+880 01711-234567</p>
          <div className="mt-3">
            <StatusBadge status="active">সক্রিয়</StatusBadge>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-5 mt-4 pb-6 space-y-4">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold text-[#8A97B5] uppercase tracking-wide mb-2">{group.title}</p>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E4E9F5]">
              {group.items.map((item, i) => (
                <button
                  key={item.screen}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F8F9FD] transition-colors ${i < group.items.length - 1 ? "border-b border-[#F0F3FA]" : ""}`}
                >
                  <div className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center text-lg">{item.icon}</div>
                  <span className="flex-1 text-sm text-[#0F1729] text-left font-['Hind_Siliguri']">{item.label}</span>
                  <ChevronRight size={16} className="text-[#C9D3E8]" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onLogout}
          className="w-full bg-[#FFEBEE] text-[#C62828] py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform font-['Hind_Siliguri']"
        >
          <LogOut size={16} /> লগ আউট
        </button>

        <p className="text-center text-xs text-[#8A97B5]">TollBD v1.0.0 • © ২০২৬ সেতু কর্তৃপক্ষ</p>
      </div>
    </div>
  );
}
