import { ReactNode } from "react";

// Badge / Status Pill
interface BadgeProps {
  status: "verified" | "pending" | "rejected" | "blocked" | "active" | "success" | "failed" | "maintenance" | "info" | "warning";
  size?: "sm" | "md";
  children: ReactNode;
}

export function StatusBadge({ status, size = "md", children }: BadgeProps) {
  const sizeClasses = size === "md" ? "px-2.5 py-0.5 text-xs" : "px-2 py-0.5 text-[10px]";
  const colorMap: Record<string, string> = {
    verified: "bg-[#00A86B] text-white",
    active: "bg-[#00A86B] text-white",
    success: "bg-[#00A86B] text-white",
    pending: "bg-[#F5A623] text-[#8A5A00]",
    maintenance: "bg-[#F5A623] text-[#8A5A00]",
    warning: "bg-[#FFF8E1] text-[#4E3200] border border-[#F9A825]",
    rejected: "bg-[#C62828] text-white",
    failed: "bg-[#C62828] text-white",
    blocked: "bg-[#C9D3E8] text-[#2D3A55]",
    info: "bg-[#E3F2FD] text-[#01315F]",
  };
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${colorMap[status] || colorMap.info}`}>
      {children}
    </span>
  );
}

// KPI Card (admin)
interface KPICardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: ReactNode;
  accent: "blue" | "green" | "amber" | "red";
}

export function KPICard({ title, value, trend, trendUp, icon, accent }: KPICardProps) {
  const accentMap = {
    blue: "bg-[#1B4FDB]",
    green: "bg-[#00A86B]",
    amber: "bg-[#F5A623]",
    red: "bg-[#C62828]",
  };
  const iconBgMap = {
    blue: "bg-[#EEF2FF] text-[#1B4FDB]",
    green: "bg-[#E6FBF2] text-[#00A86B]",
    amber: "bg-[#FFF8E8] text-[#F5A623]",
    red: "bg-[#FFEBEE] text-[#C62828]",
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E4E9F5] flex overflow-hidden">
      <div className={`w-1 flex-shrink-0 ${accentMap[accent]}`} />
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between">
          <span className={`p-2 rounded-lg ${iconBgMap[accent]}`}>{icon}</span>
          <span className="text-[#5C6B8A] text-xs">{title}</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-[#0F1729]">{value}</div>
          {trend && (
            <div className={`text-xs mt-1 ${trendUp ? "text-[#00A86B]" : "text-[#C62828]"}`}>{trend}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Vehicle type icon circle
interface VehicleIconProps {
  type: string;
  size?: number;
}
export function VehicleIcon({ type, size = 48 }: VehicleIconProps) {
  const config: Record<string, { bg: string; icon: string }> = {
    motorcycle: { bg: "#EEF2FF", icon: "🏍️" },
    car: { bg: "#E6FBF2", icon: "🚗" },
    microbus: { bg: "#FFF8E8", icon: "🚐" },
    bus: { bg: "#FFF8E8", icon: "🚌" },
    truck: { bg: "#FFEBEE", icon: "🚛" },
    heavy: { bg: "#F3E8FF", icon: "🚚" },
    cng: { bg: "#F3E8FF", icon: "🛺" },
  };
  const c = config[type] || config.car;
  return (
    <div
      className="flex items-center justify-center rounded-full text-xl flex-shrink-0"
      style={{ width: size, height: size, background: c.bg }}
    >
      {c.icon}
    </div>
  );
}

// Transaction row
interface TransactionRowProps {
  type: "toll" | "deposit" | "refund";
  title: string;
  subtitle: string;
  amount: string;
  isDebit?: boolean;
  status?: string;
  onClick?: () => void;
}
export function TransactionRow({ type, title, subtitle, amount, isDebit = true, status, onClick }: TransactionRowProps) {
  const iconConfig = {
    toll: { bg: "bg-[#EEF2FF]", icon: "🛣️", color: "text-[#1B4FDB]" },
    deposit: { bg: "bg-[#E6FBF2]", icon: "💳", color: "text-[#00A86B]" },
    refund: { bg: "bg-[#FFF8E1]", icon: "↩️", color: "text-[#F9A825]" },
  };
  const ic = iconConfig[type];
  return (
    <div
      className="flex items-center gap-3 py-4 px-4 border-b border-[#E4E9F5] hover:bg-[#F8F9FD] cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${ic.bg}`}>
        <span className="text-lg">{ic.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[#0F1729] text-sm truncate">{title}</div>
        <div className="text-xs text-[#5C6B8A] mt-0.5 truncate">{subtitle}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`font-semibold text-sm ${isDebit ? "text-[#C62828]" : "text-[#00A86B]"}`}>
          {isDebit ? "−" : "+"}৳{amount}
        </div>
        {status && <div className="text-[10px] text-[#8A97B5] mt-0.5">{status}</div>}
      </div>
    </div>
  );
}

// Payment Method Card
interface PaymentMethodCardProps {
  logo: string;
  name: string;
  subtitle: string;
  recommended?: boolean;
  insufficient?: boolean;
  selected?: boolean;
  onClick?: () => void;
}
export function PaymentMethodCard({ logo, name, subtitle, recommended, insufficient, selected, onClick }: PaymentMethodCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selected ? "border-2 border-[#1B4FDB] bg-[#EEF2FF]" : "border border-[#E4E9F5] bg-white hover:border-[#C7D4FF]"} ${insufficient ? "opacity-50" : ""}`}
      onClick={!insufficient ? onClick : undefined}
    >
      <div className="w-10 h-10 rounded-lg bg-[#F0F3FA] flex items-center justify-center text-2xl flex-shrink-0">{logo}</div>
      <div className="flex-1">
        <div className="font-semibold text-[#0F1729] text-sm">{name}</div>
        <div className="text-xs text-[#5C6B8A] mt-0.5">{subtitle}</div>
        {insufficient && <div className="text-xs text-[#C62828] mt-0.5">অপর্যাপ্ত ব্যালেন্স</div>}
      </div>
      {recommended && !insufficient && (
        <StatusBadge status="success" size="sm">Recommended</StatusBadge>
      )}
      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${selected ? "border-[#1B4FDB] bg-[#1B4FDB]" : "border-[#C9D3E8]"}`}>
        {selected && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
      </div>
    </div>
  );
}

// Bridge Card
interface BridgeCardProps {
  name: string;
  nameBn: string;
  location: string;
  category: string;
  status: "active" | "maintenance";
  minToll: string;
  selected?: boolean;
  onClick?: () => void;
}
export function BridgeCard({ name, nameBn, location, category, status, minToll, selected, onClick }: BridgeCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selected ? "border-2 border-[#1B4FDB] bg-[#EEF2FF]" : "border border-[#E4E9F5] bg-white hover:border-[#C7D4FF] hover:-translate-y-0.5"}`}
      onClick={onClick}
    >
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#EEF2FF] to-[#C7D4FF] flex items-center justify-center text-3xl flex-shrink-0">
        🌉
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[#0F1729] text-sm">{nameBn}</div>
        <div className="text-xs text-[#5C6B8A] flex items-center gap-1 mt-0.5">
          <span>📍</span> {location}
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 bg-[#EEF2FF] text-[#1B4FDB] rounded-full">{category}</span>
          <StatusBadge status={status} size="sm">{status === "active" ? "সক্রিয়" : "রক্ষণাবেক্ষণ"}</StatusBadge>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-[#8A97B5]">শুরু থেকে</div>
        <div className="font-semibold text-[#1B4FDB] text-sm">৳{minToll}</div>
      </div>
    </div>
  );
}

// Empty State
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-[#F0F3FA] flex items-center justify-center text-5xl mb-6">{icon}</div>
      <h3 className="font-semibold text-[#0F1729] text-lg mb-2">{title}</h3>
      <p className="text-[#5C6B8A] text-sm max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Snackbar/Toast - we use sonner
