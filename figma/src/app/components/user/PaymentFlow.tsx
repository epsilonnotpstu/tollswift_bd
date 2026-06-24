import { useState } from "react";
import { ChevronLeft, Search, Shield, CheckCircle, Download, QrCode } from "lucide-react";
import { BridgeCard, PaymentMethodCard, VehicleIcon } from "../ui/TollBDComponents";

// Step 1: Select Bridge
interface SelectBridgeProps {
  onSelect: (bridge: string) => void;
  onBack: () => void;
}
const bridges = [
  { name: "Padma Bridge", nameBn: "পদ্মা সেতু", location: "মাওয়া-জাজিরা", category: "এক্সপ্রেসওয়ে", status: "active" as const, minToll: "১,৫০০" },
  { name: "Meghna Bridge", nameBn: "মেঘনা সেতু", location: "কুমিল্লা", category: "জাতীয়", status: "active" as const, minToll: "৩০০" },
  { name: "Jamuna Bridge", nameBn: "যমুনা সেতু", location: "সিরাজগঞ্জ", category: "জাতীয়", status: "active" as const, minToll: "৮৫০" },
  { name: "Rupsha Bridge", nameBn: "রূপসা সেতু", location: "খুলনা", category: "স্থানীয়", status: "active" as const, minToll: "১৫০" },
  { name: "Bhairab Bridge", nameBn: "ভৈরব সেতু", location: "কিশোরগঞ্জ", category: "জাতীয়", status: "maintenance" as const, minToll: "২০০" },
];
const bridgeCategories = ["সব", "এক্সপ্রেসওয়ে", "জাতীয়", "স্থানীয়"];

export function SelectBridgeScreen({ onSelect, onBack }: SelectBridgeProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("সব");

  const filtered = bridges.filter(
    (b) =>
      (category === "সব" || b.category === category) &&
      (b.nameBn.includes(query) || b.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={20} className="text-[#0F1729]" />
          </button>
          <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">সেতু বেছে নিন</h1>
          <span className="ml-auto text-xs bg-[#EEF2FF] text-[#1B4FDB] px-3 py-1 rounded-full font-medium">১ / ৪</span>
        </div>

        {/* Search */}
        <div className="flex items-center bg-[#F0F3FA] rounded-full border border-[#E4E9F5] px-4 py-2.5 gap-2">
          <Search size={16} className="text-[#8A97B5] flex-shrink-0" />
          <input
            type="text"
            placeholder="সেতুর নাম খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#0F1729] outline-none placeholder:text-[#8A97B5]"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {bridgeCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? "bg-[#1B4FDB] text-white" : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3">
        {filtered.map((b) => (
          <BridgeCard
            key={b.name}
            {...b}
            onClick={() => onSelect(b.name)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#8A97B5]">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-['Hind_Siliguri']">কোনো সেতু পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 2: Select Vehicle
interface SelectVehicleProps {
  bridge: string;
  onSelect: (vehicle: string) => void;
  onBack: () => void;
}
const vehicles = [
  { type: "car", plate: "ঢাকা মেট্রো-ক ৩৪-৫৬", owner: "মোহাম্মদ রহিম", toll: "১,৫০০", cat: "B" },
  { type: "motorcycle", plate: "ঢাকা মেট্রো-ক ৭৮-৯০", owner: "মোহাম্মদ রহিম", toll: "৭৫০", cat: "A" },
];

export function SelectVehicleScreen({ bridge, onSelect, onBack }: SelectVehicleProps) {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri'] truncate">{bridge || "পদ্মা সেতু"}</h1>
          <span className="ml-auto text-xs bg-[#EEF2FF] text-[#1B4FDB] px-3 py-1 rounded-full font-medium flex-shrink-0">২ / ৪</span>
        </div>

        {/* Bridge summary strip */}
        <div className="bg-[#EEF2FF] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1B4FDB] font-['Hind_Siliguri']">{bridge || "পদ্মা সেতু"}</span>
            <span className="text-xs bg-white text-[#1B4FDB] px-2 py-0.5 rounded-full">এক্সপ্রেসওয়ে</span>
          </div>
          <span className="text-xs text-[#5C6B8A]">শুরু ৳৭৫০ থেকে</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 pb-28">
        <p className="text-sm font-semibold text-[#0F1729] mb-3 font-['Hind_Siliguri']">আপনার যানবাহন</p>
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div
              key={v.plate}
              onClick={() => setSelected(v.plate)}
              className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-3 cursor-pointer transition-all ${selected === v.plate ? "border-[#1B4FDB] bg-[#EEF2FF]" : "border-[#E4E9F5]"}`}
            >
              <VehicleIcon type={v.type} />
              <div className="flex-1">
                <p className="font-bold text-sm text-[#0F1729] font-mono">{v.plate}</p>
                <p className="text-xs text-[#5C6B8A] mt-0.5">{v.owner} • {v.type === "car" ? "গাড়ি" : "মোটরসাইকেল"}</p>
                <p className="text-xs text-[#1B4FDB] font-semibold mt-1.5">এই গাড়িতে: ৳{v.toll}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${selected === v.plate ? "border-[#1B4FDB] bg-[#1B4FDB]" : "border-[#C9D3E8]"}`}>
                {selected === v.plate && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E9F5] px-5 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#5C6B8A] font-mono">{selected}</span>
            <span className="font-bold text-[#1B4FDB]">টোল: ৳১,৫০০</span>
          </div>
          <button
            onClick={() => onSelect(selected)}
            className="w-full bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
          >
            পেমেন্ট পদ্ধতি →
          </button>
        </div>
      )}
    </div>
  );
}

// Step 3: Payment Method
interface PaymentMethodProps {
  onConfirm: () => void;
  onBack: () => void;
}
export function PaymentMethodScreen({ onConfirm, onBack }: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState("wallet");

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">পেমেন্ট পদ্ধতি</h1>
          <span className="ml-auto text-xs bg-[#EEF2FF] text-[#1B4FDB] px-3 py-1 rounded-full font-medium">৩ / ৪</span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 pb-28 space-y-4">
        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-[#E4E9F5] p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#5C6B8A] uppercase tracking-wide mb-3">পেমেন্টের বিবরণ</p>
          {[
            { label: "সেতু", value: "পদ্মা সেতু" },
            { label: "গাড়ি", value: "ঢাকা মেট্রো-ক ৩৪-৫৬" },
            { label: "ক্যাটাগরি", value: "B (গাড়ি)" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm py-2 border-b border-[#F0F3FA]">
              <span className="text-[#5C6B8A] font-['Hind_Siliguri']">{row.label}</span>
              <span className="text-[#0F1729] font-medium">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 mt-1">
            <span className="font-bold text-[#0F1729] font-['Hind_Siliguri']">মোট পরিমাণ</span>
            <span className="text-xl font-bold text-[#1B4FDB]">৳ ১,৫০০</span>
          </div>
        </div>

        <div className="space-y-3">
          <PaymentMethodCard
            logo="💰"
            name="TollBD ওয়ালেট"
            subtitle="ব্যালেন্স: ৳১২,৩৪০"
            recommended
            selected={selectedMethod === "wallet"}
            onClick={() => setSelectedMethod("wallet")}
          />
          <PaymentMethodCard
            logo="🔒"
            name="SSLCommerz"
            subtitle="ডেবিট / ক্রেডিট কার্ড"
            selected={selectedMethod === "ssl"}
            onClick={() => setSelectedMethod("ssl")}
          />
          <PaymentMethodCard
            logo="🔴"
            name="bKash"
            subtitle="মোবাইল ব্যাংকিং"
            selected={selectedMethod === "bkash"}
            onClick={() => setSelectedMethod("bkash")}
          />
          <PaymentMethodCard
            logo="🟠"
            name="Nagad"
            subtitle="মোবাইল ব্যাংকিং"
            selected={selectedMethod === "nagad"}
            onClick={() => setSelectedMethod("nagad")}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E4E9F5]">
        <button
          onClick={onConfirm}
          className="w-full bg-[#1B4FDB] text-white py-4 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
        >
          নিশ্চিত করুন →
        </button>
      </div>
    </div>
  );
}

// Step 4: Confirm Payment
interface ConfirmPaymentProps {
  onPay: () => void;
  onBack: () => void;
}
export function ConfirmPaymentScreen({ onPay, onBack }: ConfirmPaymentProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPay();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      <div className="bg-white px-5 pt-12 pb-4 border-b border-[#E4E9F5]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">পেমেন্ট নিশ্চিত করুন</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 pb-28 space-y-4">
        {/* Receipt-style summary */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border-l-4 border-l-[#1B4FDB]">
          <div className="px-4 pt-4 pb-2 border-b border-dashed border-[#E4E9F5]">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-[#1B4FDB]" />
              <p className="text-sm font-semibold text-[#0F1729] font-['Hind_Siliguri']">পেমেন্টের বিবরণ</p>
            </div>
            {[
              { label: "সেতু", value: "পদ্মা সেতু" },
              { label: "গাড়ি", value: "ঢাকা মেট্রো-ক ৩৪-৫৬" },
              { label: "ক্যাটাগরি", value: "B (গাড়ি)" },
              { label: "তারিখ", value: "২৩ জুন, ২০২৬" },
              { label: "পদ্ধতি", value: "TollBD ওয়ালেট" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm py-2.5 border-b border-[#F8F9FD]">
                <span className="text-[#5C6B8A] font-['Hind_Siliguri']">{row.label}</span>
                <span className="text-[#0F1729] font-medium">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-4 flex justify-between items-center">
            <span className="font-bold text-[#0F1729] font-['Hind_Siliguri']">মোট</span>
            <span className="text-2xl font-bold text-[#1B4FDB]">৳ ১,৫০০</span>
          </div>
        </div>

        {/* SSL badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#5C6B8A]">
          <Shield size={14} className="text-[#00A86B]" />
          128-bit SSL সুরক্ষিত পেমেন্ট
        </div>

        {/* Biometric prompt */}
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center border border-[#E4E9F5]">
          <div className="w-14 h-14 bg-[#EEF2FF] rounded-full flex items-center justify-center text-3xl mb-3">👆</div>
          <p className="text-sm text-[#5C6B8A] font-['Hind_Siliguri'] text-center">ফিঙ্গারপ্রিন্ট দিয়ে নিশ্চিত করুন</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E4E9F5]">
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-[#1B4FDB] text-white py-4 rounded-xl font-semibold text-base active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              প্রক্রিয়াকরণ হচ্ছে...
            </>
          ) : (
            "৳ ১,৫০০ পরিশোধ করুন"
          )}
        </button>
      </div>
    </div>
  );
}

// Payment Success
interface PaymentSuccessProps {
  onHome: () => void;
  onPayAnother: () => void;
  onReceipt: () => void;
}
export function PaymentSuccessScreen({ onHome, onPayAnother, onReceipt }: PaymentSuccessProps) {
  const txId = "TX-2026-06-23-8847";
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Background accent */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-[#E6FBF2]" />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-16 relative z-10">
        {/* Success animation */}
        <div className="w-24 h-24 bg-[#00A86B] rounded-full flex items-center justify-center text-5xl mb-5 shadow-lg shadow-[#00A86B]/30">
          <CheckCircle className="text-white" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-[#00A86B] font-['Hind_Siliguri']">পেমেন্ট সফল!</h2>
        <p className="text-sm text-[#5C6B8A] mt-1 font-['Hind_Siliguri']">৳ ১,৫০০ পরিশোধ করা হয়েছে</p>

        {/* Transaction card */}
        <div className="w-full bg-white rounded-2xl shadow-lg border border-[#E4E9F5] mt-6 overflow-hidden">
          <div className="bg-[#1B4FDB] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">লেনদেন আইডি</span>
              <button className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full">কপি করুন</button>
            </div>
            <p className="font-mono text-white font-bold text-sm mt-1">{txId}</p>
          </div>

          {[
            { label: "সেতু", value: "পদ্মা সেতু" },
            { label: "গাড়ি", value: "ঢাকা মেট্রো-ক ৩৪-৫৬" },
            { label: "পরিমাণ", value: "৳ ১,৫০০" },
            { label: "সময়", value: "১১:৩২ AM, ২৩ জুন" },
            { label: "পদ্ধতি", value: "TollBD ওয়ালেট" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center text-sm px-4 py-3 border-b border-[#F0F3FA]">
              <span className="text-[#5C6B8A] font-['Hind_Siliguri']">{row.label}</span>
              <span className="text-[#0F1729] font-medium">{row.value}</span>
            </div>
          ))}

          {/* QR Code */}
          <div className="flex flex-col items-center py-5">
            <div className="w-36 h-36 bg-[#F0F3FA] rounded-xl flex items-center justify-center border border-[#E4E9F5]">
              <QrCode size={80} className="text-[#0F1729]" />
            </div>
            <p className="text-xs text-[#8A97B5] mt-2 font-['Hind_Siliguri']">QR দিয়ে যাচাই করুন</p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3 mt-4 pb-8">
          <button onClick={onReceipt} className="w-full border-2 border-[#1B4FDB] text-[#1B4FDB] py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Download size={16} /> রসিদ ডাউনলোড
          </button>
          <button onClick={onPayAnother} className="w-full bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform font-['Hind_Siliguri']">
            আরেকটি টোল দিন
          </button>
          <button onClick={onHome} className="w-full text-[#5C6B8A] py-3 text-sm font-['Hind_Siliguri']">হোমে ফিরুন</button>
        </div>
      </div>
    </div>
  );
}
