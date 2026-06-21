import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type RevenuePoint = {
  date: string
  revenue: number
  vehicles: number
}

type RevenueChartProps = {
  data: RevenuePoint[]
  selectedRange: '7d' | '30d' | '6m' | '1y'
  onRangeChange: (range: '7d' | '30d' | '6m' | '1y') => void
  titleSuffix?: string
}

export function RevenueChart({ data, selectedRange, onRangeChange, titleSuffix }: RevenueChartProps) {
  const rangeButtons: Array<{ key: RevenueChartProps['selectedRange']; label: string }> = [
    { key: '7d', label: '৭ দিন' },
    { key: '30d', label: '৩০ দিন' },
    { key: '6m', label: '৬ মাস' },
    { key: '1y', label: '১ বছর' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900">দৈনিক আয় — {titleSuffix || 'শেষ ৩০ দিন'}</h3>
        <div className="flex gap-1">
          {rangeButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => onRangeChange(button.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                selectedRange === button.key
                  ? 'bg-[#006A4E] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#006A4E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
