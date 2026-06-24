import { Plus, ChevronLeft, Camera } from "lucide-react";
import { useState } from "react";
import { StatusBadge, VehicleIcon, EmptyState } from "../ui/TollBDComponents";

interface VehiclesScreenProps {
  onNavigate: (screen: string) => void;
}

const sampleVehicles = [
  { type: "car", plate: "ঢাকা মেট্রো-ক ৩৪-৫৬", owner: "মোহাম্মদ রহিম", status: "verified" as const, category: "B" },
  { type: "motorcycle", plate: "ঢাকা মেট্রো-ক ৭৮-৯০", owner: "মোহাম্মদ রহিম", status: "pending" as const, category: "A" },
];

export function VehiclesScreen({ onNavigate }: VehiclesScreenProps) {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FD] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white border-b border-[#E4E9F5]">
        <h1 className="font-bold text-[#0F1729] text-lg font-['Hind_Siliguri']">আমার গাড়ি</h1>
        <button
          onClick={() => onNavigate("addvehicle")}
          className="w-10 h-10 bg-[#1B4FDB] rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Pending banner */}
      {sampleVehicles.some((v) => v.status === "pending") && (
        <div className="mx-5 mt-4 bg-[#FFF8E1] border border-[#F9A825]/30 border-l-4 border-l-[#F9A825] rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">⏳</span>
          <p className="text-sm text-[#4E3200] font-['Hind_Siliguri']">১ টি গাড়ি যাচাইয়ের অপেক্ষায়</p>
        </div>
      )}

      <div className="flex-1 px-5 mt-4 pb-6 space-y-3">
        {sampleVehicles.map((vehicle, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#E4E9F5] p-4 flex items-center gap-3 shadow-sm active:bg-[#EEF2FF] cursor-pointer transition-colors"
          >
            <VehicleIcon type={vehicle.type} size={48} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#0F1729] font-mono">{vehicle.plate}</p>
              <p className="text-xs text-[#5C6B8A] mt-0.5">{vehicle.owner}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] bg-[#EEF2FF] text-[#1B4FDB] px-2 py-0.5 rounded-full">Category {vehicle.category}</span>
                <StatusBadge status={vehicle.status} size="sm">
                  {vehicle.status === "verified" ? "অনুমোদিত" : "যাচাইয়ের অপেক্ষায়"}
                </StatusBadge>
              </div>
            </div>
            <span className="text-[#C9D3E8]">›</span>
          </div>
        ))}

        {/* Add vehicle CTA */}
        <button
          onClick={() => onNavigate("addvehicle")}
          className="w-full border-2 border-dashed border-[#C9D3E8] rounded-2xl py-6 flex flex-col items-center gap-2 text-[#8A97B5] hover:border-[#1B4FDB] hover:text-[#1B4FDB] transition-colors"
        >
          <Plus size={24} />
          <span className="text-sm font-medium font-['Hind_Siliguri']">নতুন গাড়ি নিবন্ধন করুন</span>
        </button>
      </div>
    </div>
  );
}

// Add Vehicle Screen - Step 1
interface AddVehicleStep1Props {
  onNext: () => void;
  onBack: () => void;
}
const vehicleTypes = [
  { id: "motorcycle", icon: "🏍️", label: "মোটরসাইকেল", cat: "A" },
  { id: "car", icon: "🚗", label: "গাড়ি", cat: "B" },
  { id: "microbus", icon: "🚐", label: "মাইক্রোবাস", cat: "C" },
  { id: "bus", icon: "🚌", label: "বাস", cat: "D" },
  { id: "truck", icon: "🚛", label: "ট্রাক", cat: "E" },
  { id: "heavy", icon: "🚚", label: "ভারী যান", cat: "F" },
];
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric"];

export function AddVehicleStep1({ onNext, onBack }: AddVehicleStep1Props) {
  const [selectedType, setSelectedType] = useState("");
  const [plate, setPlate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [fuel, setFuel] = useState("");

  const canNext = selectedType && plate && ownerName;

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-[#E4E9F5]">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#0F1729]" />
        </button>
        <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">গাড়ি নিবন্ধন</h1>
        <span className="text-xs text-[#8A97B5]">1/2</span>
      </div>

      <div className="flex gap-2 mx-6 mt-4 mb-6">
        {[1, 2].map((s) => <div key={s} className={`flex-1 h-1 rounded-full ${s === 1 ? "bg-[#1B4FDB]" : "bg-[#E4E9F5]"}`} />)}
      </div>

      <div className="flex-1 px-6 pb-24 space-y-5 overflow-y-auto">
        {/* Vehicle type grid */}
        <div>
          <p className="text-sm font-semibold text-[#0F1729] mb-3 font-['Hind_Siliguri']">যানবাহনের ধরন *</p>
          <div className="grid grid-cols-3 gap-2.5">
            {vehicleTypes.map((vt) => (
              <button
                key={vt.id}
                onClick={() => setSelectedType(vt.id)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${selectedType === vt.id ? "border-[#1B4FDB] bg-[#EEF2FF]" : "border-[#E4E9F5] bg-[#F8F9FD]"}`}
              >
                <span className="text-3xl">{vt.icon}</span>
                <span className={`text-xs font-medium font-['Hind_Siliguri'] ${selectedType === vt.id ? "text-[#1B4FDB]" : "text-[#5C6B8A]"}`}>
                  {vt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Plate number */}
        <div>
          <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">রেজিস্ট্রেশন নম্বর *</label>
          <input
            type="text"
            placeholder="ঢাকা মেট্রো-ক XX-XXXX"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3.5 text-sm text-[#0F1729] outline-none focus:border-[#1B4FDB] focus:ring-2 focus:ring-[#1B4FDB]/10 placeholder:text-[#8A97B5] font-mono"
          />
        </div>

        {/* Owner name */}
        <div>
          <label className="text-xs font-medium text-[#5C6B8A] mb-1.5 block">মালিকের নাম *</label>
          <input
            type="text"
            placeholder="মালিকের পূর্ণ নাম"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3.5 text-sm text-[#0F1729] outline-none focus:border-[#1B4FDB] focus:ring-2 focus:ring-[#1B4FDB]/10 placeholder:text-[#8A97B5]"
          />
        </div>

        {/* Fuel type */}
        <div>
          <p className="text-xs font-medium text-[#5C6B8A] mb-2">জ্বালানির ধরন</p>
          <div className="flex gap-2 flex-wrap">
            {fuelTypes.map((f) => (
              <button
                key={f}
                onClick={() => setFuel(f)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${fuel === f ? "bg-[#1B4FDB] text-white border-[#1B4FDB]" : "bg-white text-[#5C6B8A] border-[#E4E9F5]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* BRTA info */}
        <div className="bg-[#FFF8E1] border border-[#F9A825]/30 rounded-xl p-4 flex gap-3">
          <span className="text-lg">ℹ️</span>
          <p className="text-xs text-[#4E3200]">আপনার গাড়ি BRTA ডাটাবেজ থেকে যাচাই করা হতে পারে।</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E4E9F5]">
        <button
          onClick={onNext}
          disabled={!canNext}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${canNext ? "bg-[#1B4FDB] text-white active:scale-95" : "bg-[#E4E9F5] text-[#8A97B5] cursor-not-allowed"}`}
        >
          পরবর্তী →
        </button>
      </div>
    </div>
  );
}

// Add Vehicle Step 2
interface AddVehicleStep2Props {
  onSubmit: () => void;
  onBack: () => void;
}
export function AddVehicleStep2({ onSubmit, onBack }: AddVehicleStep2Props) {
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-[#E4E9F5]">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#F0F3FA] flex items-center justify-center">
          <ChevronLeft size={20} className="text-[#0F1729]" />
        </button>
        <h1 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">গাড়ির ছবি</h1>
        <span className="text-xs text-[#8A97B5]">2/2</span>
      </div>

      <div className="flex gap-2 mx-6 mt-4 mb-6">
        {[1, 2].map((s) => <div key={s} className="flex-1 h-1 rounded-full bg-[#1B4FDB]" />)}
      </div>

      <div className="flex-1 px-6 space-y-5 overflow-y-auto pb-24">
        <p className="text-sm text-[#5C6B8A] font-['Hind_Siliguri']">গাড়ির সামনে ও পেছনের স্পষ্ট ছবি আপলোড করুন</p>

        <div className="flex gap-4">
          {[
            { label: "সামনের দিক", state: frontUploaded, toggle: () => setFrontUploaded(!frontUploaded) },
            { label: "পেছনের দিক", state: backUploaded, toggle: () => setBackUploaded(!backUploaded) },
          ].map((zone) => (
            <button
              key={zone.label}
              onClick={zone.toggle}
              className={`flex-1 h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${zone.state ? "border-[#1B4FDB] bg-[#EEF2FF]" : "border-[#C9D3E8] bg-[#F8F9FD]"}`}
            >
              {zone.state ? (
                <>
                  <span className="text-3xl">✅</span>
                  <span className="text-xs text-[#1B4FDB] font-medium">আপলোড হয়েছে</span>
                </>
              ) : (
                <>
                  <Camera size={28} className="text-[#8A97B5]" />
                  <span className="text-xs text-[#8A97B5] font-['Hind_Siliguri'] text-center">{zone.label}</span>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="bg-[#F0F3FA] rounded-xl p-4 flex gap-3">
          <span className="text-lg">ℹ️</span>
          <div>
            <p className="text-xs font-medium text-[#0F1729]">যাচাইয়ের সময়</p>
            <p className="text-xs text-[#5C6B8A] mt-0.5">আপনার গাড়ি যাচাই করতে ২৪–৪৮ ঘণ্টা সময় লাগতে পারে।</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-[#E4E9F5]">
        <button
          onClick={onSubmit}
          className="w-full bg-[#1B4FDB] text-white py-4 rounded-xl font-semibold text-sm active:scale-95 transition-transform font-['Hind_Siliguri']"
        >
          জমা দিন
        </button>
      </div>
    </div>
  );
}
