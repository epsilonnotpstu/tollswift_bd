import { format } from 'date-fns'
import { Bell } from 'lucide-react'

type TopBarProps = {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle || format(new Date(), 'EEEE, dd MMM yyyy')}</p>
      </div>
      <button className="relative rounded-lg border border-slate-200 p-2 text-slate-600">
        <Bell className="h-5 w-5" />
      </button>
    </header>
  )
}
