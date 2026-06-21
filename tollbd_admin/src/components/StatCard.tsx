type StatCardProps = {
  label: string
  value: string
  trend?: string
  color?: 'green' | 'blue' | 'amber' | 'red'
}

const colorStyles: Record<NonNullable<StatCardProps['color']>, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
}

export function StatCard({ label, value, trend, color = 'green' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {trend && (
        <div className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${colorStyles[color]}`}>
          {trend}
        </div>
      )}
    </div>
  )
}
