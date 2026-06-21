import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import type { ColumnDef } from '@tanstack/react-table'
import { useSearchParams } from 'react-router-dom'

import { DataTable } from '../components/DataTable'
import { db } from '../services/firebase'
import type { TollGate } from '../types/models'

export function GatesPage() {
  const [gates, setGates] = useState<TollGate[]>([])
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'toll_gates'), (snapshot) => {
      setGates(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TollGate[])
    })

    return () => unsub()
  }, [])

  const filterGate = (searchParams.get('gate') || '').trim().toLowerCase()

  const rows = useMemo(() => {
    const filtered = filterGate
      ? gates.filter((item) => item.name.toLowerCase().includes(filterGate))
      : gates
    return filtered.map((item) => ({
        id: item.id,
        name: item.name,
        road: item.road_name,
        status: item.status,
        rates: Object.entries(item.toll_rates || {})
          .slice(0, 2)
          .map(([k, v]) => `${k}: ৳${Math.round(v / 100)}`)
          .join(' • '),
      }))
  }, [filterGate, gates])

  const columns: ColumnDef<(typeof rows)[number]>[] = [
    { header: 'Gate Name', accessorKey: 'name' },
    { header: 'Road', accessorKey: 'road' },
    { header: 'Sample Rates', accessorKey: 'rates' },
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

  return (
    <div>
      <h3 className="mb-3 text-lg font-bold text-slate-900">All Toll Gates</h3>
      {filterGate && (
        <p className="mb-2 text-sm text-slate-500">Filtered by gate: {searchParams.get('gate')}</p>
      )}
      <DataTable data={rows} columns={columns} />
    </div>
  )
}
