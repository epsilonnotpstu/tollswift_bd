import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { db, processDisputeRefundFn } from '../services/firebase'
import type { Dispute, UserProfile } from '../types/models'

type ColumnKey = 'open' | 'in_review' | 'resolved'

const statusMap: Record<ColumnKey, string[]> = {
  open: ['open'],
  in_review: ['in_review', 'reviewing'],
  resolved: ['resolved'],
}

export function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [users, setUsers] = useState<Record<string, UserProfile>>({})
  const [selected, setSelected] = useState<Dispute | null>(null)
  const [refundAmount, setRefundAmount] = useState('0')
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    const unsubs: Array<() => void> = []

    unsubs.push(
      onSnapshot(collection(db, 'disputes'), (snapshot) => {
        setDisputes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Dispute[])
      }),
    )

    unsubs.push(
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const map: Record<string, UserProfile> = {}
        snapshot.docs.forEach((item) => {
          map[item.id] = { ...(item.data() as UserProfile) }
        })
        setUsers(map)
      }),
    )

    return () => {
      unsubs.forEach((u) => u())
    }
  }, [])

  const columns = useMemo(() => {
    return (Object.keys(statusMap) as ColumnKey[]).map((key) => {
      const items = disputes.filter((item) => statusMap[key].includes(item.status))
      return { key, items }
    })
  }, [disputes])

  const resolveDispute = async (withRefund: boolean) => {
    if (!selected) return

    try {
      await processDisputeRefundFn({
        disputeId: selected.id,
        refundAmount: withRefund ? Number(refundAmount || 0) : 0,
        adminNote,
      })
      toast.success('Dispute processed')
      setSelected(null)
      setRefundAmount('0')
      setAdminNote('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process dispute')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {columns.map((col) => (
          <div key={col.key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <h3 className="mb-3 text-base font-bold text-slate-900">
              {col.key === 'open' ? 'খোলা বিরোধ' : col.key === 'in_review' ? 'পর্যালোচনাধীন' : 'সমাধান হয়েছে'}
            </h3>
            <div className="space-y-2">
              {col.items.map((item) => {
                const user = users[item.user_id]
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
                  >
                    <p className="text-sm font-bold text-slate-900">{item.id}</p>
                    <p className="text-xs text-slate-600">{user?.name_bn || user?.name || item.user_id}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">Dispute Details</h4>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="font-semibold">Dispute ID:</span> {selected.id}
              </p>
              <p>
                <span className="font-semibold">User:</span>{' '}
                {users[selected.user_id]?.name_bn || users[selected.user_id]?.name || selected.user_id}
              </p>
              <p>
                <span className="font-semibold">Reason:</span> {selected.reason}
              </p>
              <p>
                <span className="font-semibold">Description:</span> {selected.description || '-'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold">Refund amount (paisa)</label>
                <input
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="number"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Admin notes</label>
                <input
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => resolveDispute(false)}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
              >
                প্রত্যাখ্যান করুন
              </button>
              <button
                onClick={() => resolveDispute(true)}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                রিফান্ড দিন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
