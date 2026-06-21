import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import type { ColumnDef } from '@tanstack/react-table'

import { DataTable } from '../components/DataTable'
import { db } from '../services/firebase'
import type { UserProfile } from '../types/models'

export function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [queryText, setQueryText] = useState('')

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() })) as UserProfile[])
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase()
    if (!q) return users
    return users.filter((item) => {
      return (
        item.uid.toLowerCase().includes(q) ||
        item.phone?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.name_bn?.toLowerCase().includes(q)
      )
    })
  }, [queryText, users])

  const columns: ColumnDef<UserProfile>[] = [
    { header: 'Name', cell: (ctx) => ctx.row.original.name_bn || ctx.row.original.name || '-' },
    { header: 'Phone', accessorKey: 'phone' },
    {
      header: 'Wallet',
      cell: (ctx) => `৳${Math.round((ctx.row.original.wallet_balance || 0) / 100).toLocaleString()}`,
    },
    { header: 'Status', accessorKey: 'account_status' },
    { header: 'UID', accessorKey: 'uid' },
  ]

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Users</h3>
        <p className="text-sm text-slate-500">Manage user accounts and wallet overview.</p>
      </div>
      <input
        value={queryText}
        onChange={(event) => setQueryText(event.target.value)}
        placeholder="Search by name, phone, UID"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring md:max-w-sm"
      />
      <DataTable data={filtered} columns={columns} />
    </div>
  )
}
