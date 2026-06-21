import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ColumnDef } from '@tanstack/react-table'
import toast from 'react-hot-toast'

import { DataTable } from '../components/DataTable'
import { RevenueChart } from '../components/RevenueChart'
import { StatCard } from '../components/StatCard'
import { db, processDisputeRefundFn } from '../services/firebase'
import type { AnalyticsDaily, Dispute, TollGate } from '../types/models'

const pieColors = ['#006A4E', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EF4444']

export function OverviewPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState<'7d' | '30d' | '6m' | '1y'>('30d')
  const [analytics, setAnalytics] = useState<AnalyticsDaily[]>([])
  const [gates, setGates] = useState<TollGate[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [usersCount, setUsersCount] = useState(0)

  useEffect(() => {
    const unsubAnalytics = onSnapshot(collection(db, 'analytics_daily'), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as unknown as AnalyticsDaily[]
      setAnalytics(docs)
    })

    const unsubGates = onSnapshot(collection(db, 'toll_gates'), (snapshot) => {
      setGates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TollGate[])
    })

    const unsubDisputes = onSnapshot(
      query(collection(db, 'disputes'), orderBy('created_at', 'desc'), limit(10)),
      (snapshot) => {
        setDisputes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Dispute[])
      },
    )

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsersCount(snapshot.size)
    })

    return () => {
      unsubAnalytics()
      unsubGates()
      unsubDisputes()
      unsubUsers()
    }
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const todayAnalytics = analytics.filter((item) => item.date === today)

  const todayRevenue = todayAnalytics.reduce((sum, item) => sum + (item.total_revenue || 0), 0)
  const activeGates = gates.filter((item) => item.status === 'active').length
  const openDisputes = disputes.filter((item) => item.status !== 'resolved').length

  const chartData = useMemo(() => {
    const grouped = new Map<string, { date: string; revenue: number; vehicles: number }>()

    for (const item of analytics) {
      const key = item.date
      const existing = grouped.get(key) || { date: key, revenue: 0, vehicles: 0 }
      existing.revenue += item.total_revenue || 0
      existing.vehicles += item.total_vehicles || 0
      grouped.set(key, existing)
    }

    const all = [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date))
    const takeCount = range === '7d' ? 7 : range === '30d' ? 30 : range === '6m' ? 180 : 365
    return all.slice(-takeCount)
  }, [analytics, range])

  const rangeSuffix = useMemo(() => {
    if (range === '7d') return 'শেষ ৭ দিন'
    if (range === '30d') return 'শেষ ৩০ দিন'
    if (range === '6m') return 'শেষ ৬ মাস'
    return 'শেষ ১ বছর'
  }, [range])

  const pieData = useMemo(() => {
    const totals: Record<string, number> = {
      motorcycle: 0,
      car: 0,
      microbus: 0,
      truck: 0,
      bus: 0,
    }

    for (const item of todayAnalytics) {
      const vehicleCounts = item.vehicle_counts || {}
      Object.entries(vehicleCounts).forEach(([key, value]) => {
        totals[key] = (totals[key] || 0) + Number(value || 0)
      })
    }

    return Object.entries(totals).map(([name, value]) => ({ name, value }))
  }, [todayAnalytics])

  const topGatesRows = useMemo(() => {
    return [...todayAnalytics]
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .slice(0, 8)
      .map((item) => {
        const gate = gates.find((g) => g.id === item.gate_id)
        return {
          gateName: gate?.name || item.gate_id,
          road: gate?.road_name || '-',
          revenue: item.total_revenue || 0,
          vehicles: item.total_vehicles || 0,
          status: gate?.status || 'unknown',
        }
      })
  }, [gates, todayAnalytics])

  const columns: ColumnDef<(typeof topGatesRows)[number]>[] = [
    { header: 'Gate Name', accessorKey: 'gateName' },
    { header: 'Road', accessorKey: 'road' },
    {
      header: "Today's Revenue",
      accessorKey: 'revenue',
      cell: (ctx) => `৳${Math.round((ctx.getValue() as number) / 100).toLocaleString()}`,
    },
    { header: 'Vehicle Count', accessorKey: 'vehicles' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (ctx) => {
        const value = ctx.getValue() as string
        const cls =
          value === 'active'
            ? 'bg-emerald-100 text-emerald-700'
            : value === 'maintenance'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-700'
        return <span className={`rounded-full px-2 py-1 text-xs font-bold ${cls}`}>{value}</span>
      },
    },
  ]

  const quickDisputeAction = async (disputeId: string, action: 'resolve' | 'reject') => {
    try {
      await processDisputeRefundFn({
        disputeId,
        refundAmount: 0,
        adminNote: action === 'resolve' ? 'Resolved from overview dashboard' : 'Rejected from overview dashboard',
      })
      toast.success(action === 'resolve' ? 'Dispute resolved' : 'Dispute rejected')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Dispute action failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="আজকের মোট আয়"
          value={`৳${Math.round(todayRevenue / 100).toLocaleString()}`}
          trend="▲ 12% গতকাল থেকে"
          color="green"
        />
        <StatCard
          label="মোট ব্যবহারকারী"
          value={`${usersCount.toLocaleString()} জন`}
          trend="▲ 230 নতুন আজ"
          color="blue"
        />
        <StatCard
          label="সক্রিয় গেট"
          value={`${activeGates}টি`}
          trend={`${activeGates}/${gates.length} active`}
          color="amber"
        />
        <StatCard
          label="মুলতুবি বিরোধ"
          value={`${openDisputes}টি`}
          trend="🔴 জরুরি"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart
            data={chartData}
            selectedRange={range}
            onRangeChange={setRange}
            titleSuffix={rangeSuffix}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Traffic by Vehicle Type</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-sm">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: pieColors[index % pieColors.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900">Top Performing Gates</h3>
        <DataTable
          data={topGatesRows}
          columns={columns}
          onRowClick={(row) => navigate(`/gates?gate=${encodeURIComponent(row.gateName)}`)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Recent Disputes (Needs Action)</h3>
        <div className="space-y-2">
          {disputes.slice(0, 6).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.id}</p>
                <p className="text-xs text-slate-500">{item.reason}</p>
              </div>
              <div className="text-xs text-slate-600">{item.status}</div>
              <div className="flex gap-2">
                <button
                  className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                  onClick={() => quickDisputeAction(item.id, 'resolve')}
                >
                  Resolve
                </button>
                <button
                  className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                  onClick={() => quickDisputeAction(item.id, 'reject')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
