import { useState } from "react";
import { Search, Filter, Download, Eye, Ban, MessageSquare, Check, X, Plus, ToggleLeft, ToggleRight, QrCode, RefreshCw, Megaphone, Edit, Trash2 } from "lucide-react";
import { StatusBadge, VehicleIcon } from "../ui/TollBDComponents";

// ─── Users Page ────────────────────────────────────────────────────────────────
const users = [
  { id: "U001", name: "মোহাম্মদ রহিম", phone: "+880 01711-234567", joined: "১৫ জান, ২০২৬", status: "active" as const, balance: "৳১২,৩৪০", vehicles: 2 },
  { id: "U002", name: "ফারিদা বেগম", phone: "+880 01912-345678", joined: "২০ জান, ২০২৬", status: "active" as const, balance: "৳৪,২০০", vehicles: 1 },
  { id: "U003", name: "কামাল উদ্দিন", phone: "+880 01811-456789", joined: "০৫ ফেব, ২০২৬", status: "blocked" as const, balance: "৳০", vehicles: 0 },
  { id: "U004", name: "সালমা আক্তার", phone: "+880 01611-567890", joined: "১২ ফেব, ২০২৬", status: "active" as const, balance: "৳৮,৫০০", vehicles: 3 },
  { id: "U005", name: "নাসিম হাসান", phone: "+880 01511-678901", joined: "০১ মার্চ, ২০২৬", status: "pending" as const, balance: "৳০", vehicles: 1 },
];

export function AdminUsersPage() {
  const [statusFilter, setStatusFilter] = useState("সব");
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const filters = ["সব", "সক্রিয়", "ব্লক", "অযাচাই"];

  return (
    <div className="flex gap-5 h-full">
      <div className={`flex-1 min-w-0 ${selectedUser ? "hidden lg:block" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">মোট ব্যবহারকারী</h4>
            <span className="bg-[#EEF2FF] text-[#1B4FDB] text-xs px-3 py-1 rounded-full font-semibold">{users.length}</span>
          </div>
          <button className="flex items-center gap-2 bg-[#EEF2FF] text-[#1B4FDB] px-4 py-2 rounded-xl text-sm font-medium">
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex items-center bg-white border border-[#E4E9F5] rounded-xl px-3 py-2 gap-2 flex-1 min-w-48">
            <Search size={14} className="text-[#8A97B5]" />
            <input placeholder="ব্যবহারকারী খুঁজুন..." className="flex-1 text-sm outline-none text-[#0F1729] bg-transparent placeholder:text-[#8A97B5]" />
          </div>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === f ? "bg-[#1B4FDB] text-white" : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E4E9F5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FD]">
                  {["", "নাম", "ফোন", "নিবন্ধন", "স্ট্যাটাস", "ব্যালেন্স", "গাড়ি", "অ্যাকশন"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-[#8A97B5] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`border-t border-[#F0F3FA] cursor-pointer hover:bg-[#EEF2FF]/30 transition-colors ${i % 2 === 1 ? "bg-[#F8F9FD]/50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 bg-[#1B4FDB] rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {u.name.charAt(0)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#0F1729] font-['Hind_Siliguri'] whitespace-nowrap">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-[#5C6B8A] font-mono whitespace-nowrap">{u.phone}</td>
                    <td className="px-4 py-3 text-xs text-[#8A97B5] whitespace-nowrap">{u.joined}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} size="sm">
                        {u.status === "active" ? "সক্রিয়" : u.status === "blocked" ? "ব্লক" : "অযাচাই"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F1729]">{u.balance}</td>
                    <td className="px-4 py-3 text-sm text-center text-[#5C6B8A]">{u.vehicles}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center hover:bg-[#1B4FDB] hover:text-white transition-colors">
                          <Eye size={13} className="text-[#1B4FDB] hover:text-white" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#FFEBEE] flex items-center justify-center hover:bg-[#C62828] hover:text-white transition-colors">
                          <Ban size={13} className="text-[#C62828]" />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-[#F0F3FA] flex items-center justify-center hover:bg-[#5C6B8A] hover:text-white transition-colors">
                          <MessageSquare size={13} className="text-[#5C6B8A]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#E4E9F5]">
            <p className="text-xs text-[#8A97B5]">Showing 1–5 of 8,342</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs bg-[#F0F3FA] text-[#5C6B8A] rounded-lg">← আগে</button>
              {[1, 2, 3].map((p) => (
                <button key={p} className={`px-3 py-1.5 text-xs rounded-lg ${p === 1 ? "bg-[#1B4FDB] text-white" : "bg-[#F0F3FA] text-[#5C6B8A]"}`}>{p}</button>
              ))}
              <button className="px-3 py-1.5 text-xs bg-[#F0F3FA] text-[#5C6B8A] rounded-lg">পরে →</button>
            </div>
          </div>
        </div>
      </div>

      {/* User detail panel */}
      {selectedUser && (
        <div className="w-full lg:w-80 xl:w-96 bg-white rounded-2xl border border-[#E4E9F5] p-5 flex flex-col gap-4 flex-shrink-0 overflow-y-auto">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">ব্যবহারকারীর বিবরণ</h4>
            <button onClick={() => setSelectedUser(null)} className="text-[#8A97B5] hover:text-[#0F1729]">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center py-4 border-b border-[#E4E9F5]">
            <div className="w-16 h-16 bg-[#1B4FDB] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
              {selectedUser.name.charAt(0)}
            </div>
            <h3 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">{selectedUser.name}</h3>
            <p className="text-sm text-[#5C6B8A] font-mono mt-1">{selectedUser.phone}</p>
            <div className="mt-2"><StatusBadge status={selectedUser.status}>{selectedUser.status === "active" ? "সক্রিয়" : "ব্লক"}</StatusBadge></div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "ট্রিপ", value: "৩২" },
              { label: "মোট খরচ", value: "৳৪৫,২০০" },
              { label: "ব্যালেন্স", value: selectedUser.balance },
            ].map((s) => (
              <div key={s.label} className="bg-[#F8F9FD] rounded-xl p-3">
                <p className="font-bold text-[#0F1729] text-sm">{s.value}</p>
                <p className="text-[10px] text-[#8A97B5] mt-0.5 font-['Hind_Siliguri']">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <button className="flex-1 bg-[#FFEBEE] text-[#C62828] py-2.5 rounded-xl text-xs font-semibold font-['Hind_Siliguri']">ব্লক করুন</button>
            <button className="flex-1 bg-[#EEF2FF] text-[#1B4FDB] py-2.5 rounded-xl text-xs font-semibold">Message</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vehicles Verification Page ──────────────────────────────────────────────
const pendingVehicles = [
  { plate: "ঢাকা মেট্রো-ক ৩৪-৫৬", owner: "মোহাম্মদ রহিম", type: "car", submitted: "২ ঘণ্টা আগে", brta: "verified" },
  { plate: "চট্টগ্রাম-মেট্রো-খ ৭৮-৯০", owner: "ফারিদা বেগম", type: "motorcycle", submitted: "৫ ঘণ্টা আগে", brta: "unverified" },
  { plate: "ঢাকা মেট্রো-গ ১২-৩৪", owner: "কামাল উদ্দিন", type: "bus", submitted: "১ দিন আগে", brta: "mismatch" },
];

export function AdminVehiclesPage() {
  const [tab, setTab] = useState("pending");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const tabs = ["অপেক্ষমান (7)", "অনুমোদিত", "প্রত্যাখ্যাত"];

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t.includes("অপেক্ষ") ? "pending" : t.includes("অনুমোদ") ? "approved" : "rejected")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              (tab === "pending" && t.includes("অপেক্ষ")) || (tab === "approved" && t.includes("অনুমোদ")) || (tab === "rejected" && t.includes("প্রত্যাখ্য"))
                ? "bg-[#1B4FDB] text-white"
                : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "pending" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {pendingVehicles.map((v) => (
            <div key={v.plate} className="bg-white rounded-2xl border border-[#E4E9F5] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#E4E9F5]">
                <div className="flex items-center justify-between">
                  <p className="font-mono font-bold text-[#0F1729]">{v.plate}</p>
                  <span className="text-xs text-[#8A97B5]">{v.submitted}</span>
                </div>
              </div>

              {/* Images */}
              <div className="flex gap-2 p-4">
                {["সামনে", "পেছনে"].map((side) => (
                  <div key={side} className="flex-1 h-24 bg-[#F8F9FD] rounded-xl flex flex-col items-center justify-center border border-[#E4E9F5] cursor-pointer hover:border-[#1B4FDB] transition-colors">
                    <span className="text-2xl">🚗</span>
                    <span className="text-[10px] text-[#8A97B5] mt-1 font-['Hind_Siliguri']">{side}</span>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5C6B8A] font-['Hind_Siliguri']">মালিক</span>
                  <span className="font-medium text-[#0F1729]">{v.owner}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5C6B8A] font-['Hind_Siliguri']">ধরন</span>
                  <span className="font-medium text-[#0F1729]">{v.type}</span>
                </div>

                {/* BRTA verification */}
                <div className={`rounded-xl px-3 py-2 flex items-center gap-2 ${
                  v.brta === "verified" ? "bg-[#E6FBF2] text-[#006B44]" :
                  v.brta === "mismatch" ? "bg-[#FFEBEE] text-[#7F0000]" :
                  "bg-[#FFF8E1] text-[#4E3200]"
                }`}>
                  <span className="text-sm">{v.brta === "verified" ? "✅" : v.brta === "mismatch" ? "❌" : "⚠️"}</span>
                  <span className="text-xs font-medium">BRTA: {v.brta === "verified" ? "যাচাইকৃত" : v.brta === "mismatch" ? "তথ্য মেলেনি" : "অযাচাই"}</span>
                </div>

                {/* Reject reason input */}
                {rejecting === v.plate && (
                  <textarea
                    className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] p-2 text-sm text-[#0F1729] outline-none focus:border-[#C62828] resize-none"
                    rows={2}
                    placeholder="প্রত্যাখ্যানের কারণ লিখুন..."
                  />
                )}
              </div>

              <div className="flex gap-2 p-4">
                <button className="flex-1 bg-[#E6FBF2] text-[#006B44] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#00A86B] hover:text-white transition-colors">
                  <Check size={14} /> অনুমোদন
                </button>
                <button
                  onClick={() => setRejecting(rejecting === v.plate ? null : v.plate)}
                  className="flex-1 bg-[#FFEBEE] text-[#7F0000] py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#C62828] hover:text-white transition-colors"
                >
                  <X size={14} /> প্রত্যাখ্যান
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab !== "pending" && (
        <div className="bg-white rounded-2xl border border-[#E4E9F5] p-12 flex flex-col items-center text-center">
          <div className="text-5xl mb-4">{tab === "approved" ? "✅" : "❌"}</div>
          <p className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">কোনো {tab === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"} যানবাহন নেই</p>
        </div>
      )}
    </div>
  );
}

// ─── Bridges + Toll Rates Page ────────────────────────────────────────────────
const bridgeList = [
  { name: "পদ্মা সেতু", location: "মাওয়া-জাজিরা", category: "এক্সপ্রেসওয়ে", active: true },
  { name: "মেঘনা সেতু", location: "কুমিল্লা", category: "জাতীয়", active: true },
  { name: "যমুনা সেতু", location: "সিরাজগঞ্জ", category: "জাতীয়", active: true },
  { name: "রূপসা সেতু", location: "খুলনা", category: "স্থানীয়", active: true },
  { name: "ভৈরব সেতু", location: "কিশোরগঞ্জ", category: "জাতীয়", active: false },
];

const tollRates = [
  { cat: "A", type: "মোটরসাইকেল", current: "৭৫০", new: "" },
  { cat: "B", type: "গাড়ি", current: "১,৫০০", new: "" },
  { cat: "C", type: "মাইক্রোবাস", current: "২,০০০", new: "" },
  { cat: "D", type: "বাস", current: "২,৫০০", new: "" },
  { cat: "E", type: "ট্রাক", current: "৩,৫০০", new: "" },
  { cat: "F", type: "ভারী যান", current: "৫,০০০", new: "" },
];

export function AdminBridgesPage() {
  const [selectedBridge, setSelectedBridge] = useState(bridgeList[0]);
  const [rates, setRates] = useState(tollRates);
  const [editMode, setEditMode] = useState(false);
  const [bridgeStates, setBridgeStates] = useState(() => Object.fromEntries(bridgeList.map((b) => [b.name, b.active])));

  return (
    <div className="flex gap-5 h-full">
      {/* Bridge list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <button className="bg-[#1B4FDB] text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Plus size={16} /> সেতু যোগ করুন
        </button>
        {bridgeList.map((b) => (
          <div
            key={b.name}
            onClick={() => setSelectedBridge(b)}
            className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${selectedBridge.name === b.name ? "border-2 border-[#1B4FDB] bg-[#EEF2FF]" : "border-[#E4E9F5] hover:border-[#C7D4FF]"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌉</span>
                <div>
                  <p className="font-semibold text-[#0F1729] text-sm font-['Hind_Siliguri']">{b.name}</p>
                  <p className="text-xs text-[#8A97B5]">📍{b.location}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setBridgeStates((prev) => ({ ...prev, [b.name]: !prev[b.name] })); }}
                className={`w-10 h-6 rounded-full transition-colors flex items-center ${bridgeStates[b.name] ? "bg-[#00A86B] justify-end" : "bg-[#C9D3E8] justify-start"} px-0.5`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Toll rate editor */}
      <div className="flex-1 min-w-0 bg-white rounded-2xl border border-[#E4E9F5] flex flex-col">
        <div className="px-6 py-4 border-b border-[#E4E9F5] flex items-center justify-between">
          <div>
            <h4 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">{selectedBridge.name}</h4>
            <p className="text-xs text-[#8A97B5]">📍{selectedBridge.location} • {selectedBridge.category}</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${editMode ? "bg-[#1B4FDB] text-white" : "bg-[#EEF2FF] text-[#1B4FDB]"}`}
          >
            {editMode ? "সম্পাদনা বন্ধ করুন" : "সম্পাদনা করুন"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F9FD]">
                {["ক্যাটাগরি", "ধরন", "বর্তমান হার", ...(editMode ? ["নতুন হার"] : [])].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[#8A97B5] uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.map((r, i) => (
                <tr key={r.cat} className={`border-t border-[#F0F3FA] ${i % 2 === 1 ? "bg-[#F8F9FD]/50" : ""}`}>
                  <td className="px-5 py-3.5">
                    <span className="w-8 h-8 bg-[#EEF2FF] text-[#1B4FDB] rounded-lg flex items-center justify-center text-xs font-bold">{r.cat}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#0F1729] font-['Hind_Siliguri']">{r.type}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#0F1729]">৳{r.current}</td>
                  {editMode && (
                    <td className="px-5 py-3.5">
                      <input
                        type="number"
                        placeholder={r.current.replace(",", "")}
                        value={r.new}
                        onChange={(e) => {
                          const newRates = [...rates];
                          newRates[i] = { ...r, new: e.target.value };
                          setRates(newRates);
                        }}
                        className="w-28 bg-[#EEF2FF] border border-[#C7D4FF] rounded-lg px-3 py-1.5 text-sm text-[#1B4FDB] outline-none focus:border-[#1B4FDB] font-mono"
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editMode && (
          <div className="px-6 py-4 border-t border-[#E4E9F5]">
            <button className="w-full bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform font-['Hind_Siliguri']">
              হার সংরক্ষণ করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transactions Log Page ─────────────────────────────────────────────────────
const transactions = [
  { id: "TX-2026-06-23-8847", user: "মোহাম্মদ রহিম", vehicle: "ঢাকা মেট্রো-ক ৩৪-৫৬", bridge: "পদ্মা সেতু", amount: "৳১,৫০০", method: "ওয়ালেট", status: "success" as const, time: "১১:৩২" },
  { id: "TX-2026-06-23-8846", user: "ফারিদা বেগম", vehicle: "চট্টগ্রাম-মেট্রো-খ ৭৮-৯০", bridge: "মেঘনা সেতু", amount: "৳৩০০", method: "bKash", status: "success" as const, time: "১০:১৫" },
  { id: "TX-2026-06-23-8845", user: "কামাল উদ্দিন", vehicle: "ঢাকা মেট্রো-গ ১২-৩৪", bridge: "যমুনা সেতু", amount: "৳৮৫০", method: "Nagad", status: "failed" as const, time: "০৯:৪৫" },
  { id: "TX-2026-06-23-8844", user: "সালমা আক্তার", vehicle: "ঢাকা মেট্রো-ক ৫৬-৭৮", bridge: "পদ্মা সেতু", amount: "৳১,৫০০", method: "ওয়ালেট", status: "success" as const, time: "০৮:৩০" },
  { id: "TX-2026-06-23-8843", user: "নাসিম হাসান", vehicle: "খুলনা-৯০-১২-৩৪", bridge: "রূপসা সেতু", amount: "৳১৫০", method: "Card", status: "success" as const, time: "০৮:০২" },
];

export function AdminTransactionsPage() {
  const [selectedTx, setSelectedTx] = useState<typeof transactions[0] | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  return (
    <div className="flex gap-5 h-full">
      <div className={`flex-1 min-w-0 ${selectedTx ? "hidden lg:block" : ""}`}>
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-[#E4E9F5] p-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center bg-[#F0F3FA] border border-[#E4E9F5] rounded-xl px-3 py-2 gap-2 flex-1 min-w-40">
              <Search size={14} className="text-[#8A97B5]" />
              <input placeholder="TxID, ব্যবহারকারী..." className="flex-1 text-sm outline-none bg-transparent placeholder:text-[#8A97B5] text-[#0F1729]" />
            </div>
            {["সফল", "ব্যর্থ"].map((f) => (
              <button key={f} className={`px-3 py-2 rounded-xl text-xs font-medium border ${f === "সফল" ? "bg-[#E6FBF2] text-[#00A86B] border-[#00A86B]/20" : "bg-[#FFEBEE] text-[#C62828] border-[#C62828]/20"}`}>{f}</button>
            ))}
            <button className="flex items-center gap-2 bg-[#EEF2FF] text-[#1B4FDB] px-4 py-2 rounded-xl text-sm font-medium ml-auto">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {[
            { label: "মোট", value: "৳৪,৫৬,৭৮০", color: "bg-[#EEF2FF] text-[#1B4FDB]" },
            { label: "লেনদেন", value: "৩৪৫", color: "bg-[#E6FBF2] text-[#006B44]" },
            { label: "ব্যর্থ", value: "৪", color: "bg-[#FFEBEE] text-[#C62828]" },
          ].map((s) => (
            <div key={s.label} className={`px-4 py-2 rounded-xl text-sm font-semibold ${s.color}`}>
              {s.label}: {s.value}
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E4E9F5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FD]">
                  {["TxID", "ব্যবহারকারী", "গাড়ি", "সেতু", "পরিমাণ", "পদ্ধতি", "স্ট্যাটাস", "সময়"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold text-[#8A97B5] uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`border-t border-[#F0F3FA] cursor-pointer hover:bg-[#EEF2FF]/30 transition-colors ${i % 2 === 1 ? "bg-[#F8F9FD]/50" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#5C6B8A]">{tx.id.split("-").slice(-1)[0]}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#0F1729] font-['Hind_Siliguri'] whitespace-nowrap">{tx.user}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#5C6B8A] whitespace-nowrap">{tx.vehicle}</td>
                    <td className="px-4 py-3 text-sm text-[#5C6B8A] font-['Hind_Siliguri'] whitespace-nowrap">{tx.bridge}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F1729] text-sm">{tx.amount}</td>
                    <td className="px-4 py-3 text-xs text-[#5C6B8A]">{tx.method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} size="sm">{tx.status === "success" ? "সফল" : "ব্যর্থ"}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8A97B5]">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedTx && (
        <div className="w-full lg:w-80 xl:w-96 bg-white rounded-2xl border border-[#E4E9F5] p-5 flex flex-col gap-4 flex-shrink-0 overflow-y-auto">
          <div className="flex justify-between">
            <h4 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">লেনদেনের বিবরণ</h4>
            <button onClick={() => setSelectedTx(null)}><X size={18} className="text-[#8A97B5]" /></button>
          </div>

          <div className="bg-[#1B4FDB] rounded-xl p-4">
            <p className="text-white/70 text-xs">লেনদেন আইডি</p>
            <p className="font-mono text-white font-bold text-sm mt-1 break-all">{selectedTx.id}</p>
          </div>

          {[
            { label: "ব্যবহারকারী", value: selectedTx.user },
            { label: "গাড়ি", value: selectedTx.vehicle },
            { label: "সেতু", value: selectedTx.bridge },
            { label: "পরিমাণ", value: selectedTx.amount },
            { label: "পদ্ধতি", value: selectedTx.method },
            { label: "সময়", value: `২৩ জুন, ২০২৬ — ${selectedTx.time}` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm border-b border-[#F0F3FA] py-2.5">
              <span className="text-[#5C6B8A] font-['Hind_Siliguri']">{row.label}</span>
              <span className="text-[#0F1729] font-medium">{row.value}</span>
            </div>
          ))}

          <div className="flex justify-center">
            <StatusBadge status={selectedTx.status}>{selectedTx.status === "success" ? "সফলভাবে পরিশোধিত" : "ব্যর্থ"}</StatusBadge>
          </div>

          {selectedTx.status === "success" && (
            <button
              onClick={() => setShowRefundModal(true)}
              className="w-full bg-[#FFEBEE] text-[#C62828] py-3 rounded-xl text-sm font-semibold font-['Hind_Siliguri']"
            >
              রিফান্ড প্রক্রিয়া করুন
            </button>
          )}
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between mb-4">
              <h4 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">রিফান্ড প্রক্রিয়া</h4>
              <button onClick={() => setShowRefundModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#5C6B8A] mb-1.5 block">পরিমাণ</label>
                <input type="number" defaultValue="1500" className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm outline-none focus:border-[#1B4FDB]" />
              </div>
              <div>
                <label className="text-xs text-[#5C6B8A] mb-1.5 block">কারণ</label>
                <select className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm outline-none">
                  <option>ডুপ্লিকেট পেমেন্ট</option>
                  <option>প্রযুক্তিগত সমস্যা</option>
                  <option>অতিরিক্ত চার্জ</option>
                </select>
              </div>
              <textarea className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm outline-none focus:border-[#1B4FDB] resize-none" rows={3} placeholder="অতিরিক্ত নোট (ঐচ্ছিক)..." />
              <button
                onClick={() => setShowRefundModal(false)}
                className="w-full bg-[#C62828] text-white py-3.5 rounded-xl font-semibold text-sm font-['Hind_Siliguri']"
              >
                রিফান্ড নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QR Scanner Page ───────────────────────────────────────────────────────────
const gateLog = [
  { plate: "ঢাকা মেট্রো-ক ৩৪-৫৬", time: "১১:৩২", amount: "৳১,৫০০", method: "QR" },
  { plate: "চট্টগ্রাম-মেট্রো-খ ৭৮-৯০", time: "১১:১৫", amount: "৳৩০০", method: "QR" },
  { plate: "ঢাকা মেট্রো-গ ১২-৩৪", time: "১০:৫৮", amount: "৳৮৫০", method: "Manual" },
  { plate: "ঢাকা মেট্রো-ক ৫৬-৭৮", time: "১০:৪৫", amount: "৳১,৫০০", method: "QR" },
];

export function AdminQRScannerPage() {
  const [scanResult, setScanResult] = useState<"success" | "fail" | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 h-full">
      {/* Scanner */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-white rounded-2xl border border-[#E4E9F5] p-4">
          <div className="flex items-center justify-between mb-4">
            <select className="bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-2 text-sm text-[#0F1729] outline-none">
              <option>পদ্মা সেতু — গেট ১</option>
              <option>পদ্মা সেতু — গেট ২</option>
              <option>মেঘনা সেতু — গেট ১</option>
            </select>
          </div>

          {/* Camera simulation */}
          <div className="relative bg-[#0F1729] rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/20 text-center">
                <QrCode size={80} className="mx-auto mb-3" />
                <p className="text-sm">ক্যামেরা ভিউ সিমুলেশন</p>
                <p className="text-xs opacity-60 mt-1">প্রোডাকশনে ক্যামেরা ফিড দেখাবে</p>
              </div>
            </div>

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-[#00A86B] animate-bounce" />
                </div>
              </div>
            </div>

            <p className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">QR কোড স্ক্যান করুন</p>
          </div>

          {/* Simulate scan buttons */}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setScanResult("success")} className="flex-1 bg-[#E6FBF2] text-[#00A86B] py-3 rounded-xl text-sm font-semibold">✅ সফল স্ক্যান সিমুলেট</button>
            <button onClick={() => setScanResult("fail")} className="flex-1 bg-[#FFEBEE] text-[#C62828] py-3 rounded-xl text-sm font-semibold">❌ ব্যর্থ স্ক্যান সিমুলেট</button>
          </div>
        </div>

        {/* Scan result */}
        {scanResult && (
          <div className={`rounded-2xl p-4 border-l-4 ${scanResult === "success" ? "bg-[#E6FBF2] border-[#00A86B]" : "bg-[#FFEBEE] border-[#C62828]"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold font-['Hind_Siliguri'] ${scanResult === "success" ? "text-[#006B44]" : "text-[#7F0000]"}`}>
                  {scanResult === "success" ? "✅ স্ক্যান সফল" : "❌ স্ক্যান ব্যর্থ"}
                </p>
                {scanResult === "success" && (
                  <>
                    <p className="font-mono text-sm text-[#0F1729] mt-1">ঢাকা মেট্রো-ক ৩৪-৫৬</p>
                    <p className="text-xs text-[#5C6B8A]">মোহাম্মদ রহিম • ৳১,৫০০ কেটেছে</p>
                  </>
                )}
                {scanResult === "fail" && <p className="text-xs text-[#C62828] mt-1">QR কোড মেয়াদোত্তীর্ণ বা অবৈধ</p>}
              </div>
              <button onClick={() => setScanResult(null)} className="text-[#8A97B5]"><X size={18} /></button>
            </div>
          </div>
        )}

        {/* Manual lookup */}
        <div className="bg-white rounded-2xl border border-[#E4E9F5] p-4 flex gap-3">
          <input
            type="text"
            placeholder="ম্যানুয়ালি প্লেট নম্বর লিখুন..."
            className="flex-1 bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm font-mono outline-none focus:border-[#1B4FDB]"
          />
          <button className="bg-[#1B4FDB] text-white px-4 py-3 rounded-xl text-sm font-semibold">খুঁজুন</button>
        </div>
      </div>

      {/* Gate log */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E9F5] flex flex-col">
        <div className="px-5 py-4 border-b border-[#E4E9F5] flex justify-between">
          <h4 className="font-semibold text-[#0F1729] font-['Hind_Siliguri']">আজকের গেট লগ</h4>
          <span className="text-xs bg-[#EEF2FF] text-[#1B4FDB] px-3 py-1 rounded-full">{gateLog.length} টি</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {gateLog.map((log, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F3FA] hover:bg-[#F8F9FD] transition-colors">
              <div>
                <p className="font-mono text-sm font-bold text-[#0F1729]">{log.plate}</p>
                <p className="text-xs text-[#8A97B5] mt-0.5">{log.time} • {log.method}</p>
              </div>
              <p className="font-semibold text-[#00A86B] text-sm">{log.amount}</p>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-[#E4E9F5] bg-[#F8F9FD] rounded-b-2xl">
          <div className="flex justify-between text-sm">
            <span className="text-[#5C6B8A] font-['Hind_Siliguri']">মোট সংগৃহীত</span>
            <span className="font-bold text-[#00A86B]">৳৪,১৫০</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Announcements Page ────────────────────────────────────────────────────────
const announcements = [
  { id: 1, title: "পদ্মা সেতুতে নতুন টোল হার", titleBn: "পদ্মা সেতুতে নতুন টোল হার কার্যকর", type: "info", active: true, target: "সকল ব্যবহারকারী", expiry: "৩০ জুন" },
  { id: 2, title: "ভৈরব সেতু রক্ষণাবেক্ষণ", titleBn: "ভৈরব সেতু রক্ষণাবেক্ষণের জন্য বন্ধ", type: "maintenance", active: true, target: "সকল ব্যবহারকারী", expiry: "২৫ জুন" },
  { id: 3, title: "বিশেষ ছাড় — ঈদ উপলক্ষে", titleBn: "ঈদ উপলক্ষে বিশেষ ছাড়", type: "info", active: false, target: "সকল ব্যবহারকারী", expiry: "২০ জুন" },
];

export function AdminAnnouncementsPage() {
  const [tab, setTab] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const tabs = ["সক্রিয়", "নির্ধারিত", "মেয়াদোত্তীর্ণ"];

  const typeColors: Record<string, string> = {
    info: "bg-[#E3F2FD] border-[#1565C0]",
    maintenance: "bg-[#FFEBEE] border-[#C62828]",
    warning: "bg-[#FFF8E1] border-[#F9A825]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-[#1B4FDB] text-white" : "bg-white text-[#5C6B8A] border border-[#E4E9F5]"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1B4FDB] text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Plus size={16} /> নতুন ঘোষণা
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {announcements.map((ann) => (
          <div key={ann.id} className={`bg-white rounded-2xl border-l-4 border border-[#E4E9F5] overflow-hidden shadow-sm ${typeColors[ann.type]} border-l-[${ann.type === "info" ? "#1565C0" : ann.type === "maintenance" ? "#C62828" : "#F9A825"}]`} style={{ borderLeftColor: ann.type === "info" ? "#1565C0" : ann.type === "maintenance" ? "#C62828" : "#F9A825" }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={ann.type === "info" ? "info" : ann.type === "maintenance" ? "maintenance" : "warning"} size="sm">
                  {ann.type === "info" ? "তথ্য" : ann.type === "maintenance" ? "রক্ষণাবেক্ষণ" : "সতর্কতা"}
                </StatusBadge>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-5 rounded-full transition-colors flex items-center ${ann.active ? "bg-[#00A86B] justify-end" : "bg-[#C9D3E8] justify-start"} px-0.5`}>
                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              </div>
              <h4 className="font-semibold text-[#0F1729] text-sm font-['Hind_Siliguri']">{ann.titleBn}</h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#8A97B5]">
                <span>👥 {ann.target}</span>
                <span>📅 {ann.expiry}</span>
              </div>
            </div>
            <div className="flex border-t border-[#E4E9F5]">
              <button className="flex-1 py-3 text-xs text-[#1B4FDB] font-medium flex items-center justify-center gap-1 hover:bg-[#EEF2FF] transition-colors">
                <Edit size={12} /> সম্পাদনা
              </button>
              <button className="flex-1 py-3 text-xs text-[#C62828] font-medium flex items-center justify-center gap-1 hover:bg-[#FFEBEE] transition-colors border-l border-[#E4E9F5]">
                <Trash2 size={12} /> মুছুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-5">
              <h4 className="font-bold text-[#0F1729] font-['Hind_Siliguri']">নতুন ঘোষণা তৈরি করুন</h4>
              <button onClick={() => setShowCreate(false)}><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#5C6B8A] mb-1.5 block">শিরোনাম (EN)</label>
                  <input placeholder="Title in English" className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm outline-none focus:border-[#1B4FDB]" />
                </div>
                <div>
                  <label className="text-xs text-[#5C6B8A] mb-1.5 block">শিরোনাম (BN)</label>
                  <input placeholder="বাংলায় শিরোনাম" className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm outline-none focus:border-[#1B4FDB]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#5C6B8A] mb-1.5 block">বিষয়বস্তু</label>
                <textarea className="w-full bg-[#F0F3FA] rounded-xl border border-[#E4E9F5] px-4 py-3 text-sm outline-none focus:border-[#1B4FDB] resize-none" rows={3} placeholder="ঘোষণার বিষয়বস্তু লিখুন..." />
              </div>
              <div>
                <p className="text-xs text-[#5C6B8A] mb-2">ধরন</p>
                <div className="flex gap-2">
                  {["তথ্য", "সতর্কতা", "রক্ষণাবেক্ষণ"].map((t) => (
                    <button key={t} className="px-4 py-2 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#1B4FDB] border border-[#C7D4FF]">{t}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 bg-[#1B4FDB] text-white py-3.5 rounded-xl font-semibold text-sm font-['Hind_Siliguri']"
                >
                  প্রকাশ করুন
                </button>
                <button className="flex-1 border border-[#C7D4FF] text-[#1B4FDB] py-3.5 rounded-xl font-semibold text-sm font-['Hind_Siliguri']">পরে পাঠান</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
