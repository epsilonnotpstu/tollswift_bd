import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

interface KPICardProps {
  label: string;
  labelBn: string;
  value: string;
  trend?: number;
  trendPositive?: boolean;
  trendLabel?: string;
  accentColor: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export const KPICard = ({ label, labelBn, value, trend, trendPositive, trendLabel, accentColor, icon: Icon, onClick }: KPICardProps) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute left-0 top-0 h-full w-1 ${accentColor}`} />
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="font-bengali text-xs text-gray-400">{labelBn}</p>
        <p className="mt-3 text-3xl font-bold text-gray-900 leading-none">{value}</p>
        {trend !== undefined && (
          <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {trendPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend > 0 ? '+' : ''}{trend}% {trendLabel ?? ''}
          </div>
        )}
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accentColor.replace('bg-', 'bg-').replace('500', '100').replace('600', '100')}`}>
        <Icon className={`h-6 w-6 ${accentColor.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);
