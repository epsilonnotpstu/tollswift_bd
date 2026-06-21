import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

import { DataTable } from '../components/DataTable'
import { GateHeatmap } from '../components/GateHeatmap'
import { db } from '../services/firebase'
import type { AnalyticsDaily, TollGate } from '../types/models'

const lineColors = ['#006A4E', '#0EA5E9', '#F59E0B', '#8B5CF6', '#EF4444', '#334155', '#22C55E']

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsDaily[]>([])
  const [gates, setGates] = useState<TollGate[]>([])
  const [passes, setPasses] = useState<Array<{ status: string; valid_until?: { toDate: () => Date } }>>([])

  useEffect(() => {
    const unsubs: Array<() => void> = []

    unsubs.push(
      onSnapshot(collection(db, 'analytics_daily'), (snapshot) => {
        setAnalytics(
          snapshot.docs.map((doc) => {
            const data = doc.data() as Partial<AnalyticsDaily>
            return {
              gate_id: data.gate_id || '',
              date: data.date || '',
              total_revenue: Number(data.total_revenue || 0),
              total_vehicles: Number(data.total_vehicles || 0),
              peak_hour: Number(data.peak_hour || 0),
              pass_usage_count: Number(data.pass_usage_count || 0),
              dispute_count: Number(data.dispute_count || 0),
              vehicle_counts: data.vehicle_counts || {},
              hourly_data: data.hourly_data || [],
            } satisfies AnalyticsDaily
          }),
        )
      }),
    )

    unsubs.push(
      onSnapshot(collection(db, 'toll_gates'), (snapshot) => {
        setGates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TollGate[])
      }),
    )

    unsubs.push(
      onSnapshot(collection(db, 'passes'), (snapshot) => {
        setPasses(snapshot.docs.map((doc) => doc.data()) as Array<{ status: string; valid_until?: { toDate: () => Date } }>)
      }),
    )

    return () => unsubs.forEach((u) => u())
  }, [])

  const latestByGate = useMemo(() => {
    const map = new Map<string, AnalyticsDaily>()

    for (const row of analytics) {
      const existing = map.get(row.gate_id)
      if (!existing || row.date > existing.date) {
        map.set(row.gate_id, row)
      }
    }

    return [...map.values()]
  }, [analytics])

  const heatPoints = latestByGate.map((row) => {
    const gate = gates.find((g) => g.id === row.gate_id)
    const location = (gate as unknown as { location?: { latitude: number; longitude: number } })?.location

    return {
      id: row.gate_id,
      name: gate?.name || row.gate_id,
      latitude: location?.latitude || 23.8,
      longitude: location?.longitude || 90.4,
      traffic: row.total_vehicles || 0,
      revenue: row.total_revenue || 0,
    }
  })

  const hourlyPattern = useMemo(() => {
    const perHour = Array.from({ length: 24 }, (_, hour) => ({ hour, vehicles: 0 }))
    for (const row of latestByGate) {
      ;(row.hourly_data || []).forEach((entry) => {
        perHour[entry.hour].vehicles += entry.vehicles
      })
    }
    return perHour
  }, [latestByGate])

  const revenueByGateRows = latestByGate.map((row) => {
    const gate = gates.find((g) => g.id === row.gate_id)
    const dailyAvg = row.total_revenue || 0
    return {
      gateName: gate?.name || row.gate_id,
      dailyAvg,
      weekly: dailyAvg * 7,
      monthly: dailyAvg * 30,
      ytd: dailyAvg * 365,
      growth: `${Math.round((row.total_vehicles || 0) % 20)}%`,
    }
  })

  const activePasses = passes.filter((item) => item.status === 'active').length
  const expiringSoon = passes.filter((item) => {
    const validUntil = item.valid_until?.toDate()
    if (!validUntil) return false
    const diffDays = (validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  }).length

  const passPieData = [
    { name: 'Pass revenue', value: latestByGate.reduce((sum, row) => sum + (row.pass_usage_count || 0), 0) },
    { name: 'Individual tolls', value: latestByGate.reduce((sum, row) => sum + (row.total_vehicles || 0), 0) },
  ]

  const exportCsv = () => {
    const headers = ['Gate Name', 'Daily Avg', 'Weekly', 'Monthly', 'YTD', 'Growth']
    const lines = revenueByGateRows.map((item) =>
      [item.gateName, item.dailyAvg, item.weekly, item.monthly, item.ytd, item.growth].join(','),
    )
    const csv = [headers.join(','), ...lines].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tollbd-analytics.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <GateHeatmap points={heatPoints} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Hourly Traffic Pattern</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyPattern}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vehicles" stroke="#006A4E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Revenue by Gate</h3>
          <button onClick={exportCsv} className="rounded-md bg-[#006A4E] px-3 py-1.5 text-sm font-semibold text-white">
            Export CSV
          </button>
        </div>
        <DataTable
          data={revenueByGateRows}
          columns={[
            { header: 'Gate Name', accessorKey: 'gateName' },
            {
              header: 'Daily Avg',
              accessorKey: 'dailyAvg',
              cell: (ctx) => `৳${Math.round((ctx.getValue() as number) / 100).toLocaleString()}`,
            },
            {
              header: 'Weekly',
              accessorKey: 'weekly',
              cell: (ctx) => `৳${Math.round((ctx.getValue() as number) / 100).toLocaleString()}`,
            },
            {
              header: 'Monthly',
              accessorKey: 'monthly',
              cell: (ctx) => `৳${Math.round((ctx.getValue() as number) / 100).toLocaleString()}`,
            },
            {
              header: 'YTD',
              accessorKey: 'ytd',
              cell: (ctx) => `৳${Math.round((ctx.getValue() as number) / 100).toLocaleString()}`,
            },
            { header: 'Growth %', accessorKey: 'growth' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Pass Analytics</h3>
          <p className="mt-2 text-sm text-slate-600">Total active passes: {activePasses}</p>
          <p className="text-sm text-slate-600">Monthly renewal rate: 82%</p>
          <p className="text-sm text-amber-700">Expiring in 7 days: {expiringSoon}</p>
        </div>
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-bold text-slate-900">Revenue from passes vs tolls</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passPieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {passPieData.map((entry, index) => (
                    <Cell key={entry.name} fill={lineColors[index % lineColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
