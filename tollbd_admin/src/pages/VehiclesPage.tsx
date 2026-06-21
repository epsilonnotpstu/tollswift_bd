import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { adminApproveVehicleFn, adminRejectVehicleFn, db } from '../services/firebase'
import type { Vehicle } from '../types/models'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filter, setFilter] = useState<Filter>('pending')
  const [rejecting, setRejecting] = useState<Vehicle | null>(null)
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      setVehicles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Vehicle[])
    })
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return vehicles
    if (filter === 'pending') return vehicles.filter((item) => item.brtc_status === 'pending_manual')
    if (filter === 'approved') return vehicles.filter((item) => item.brtc_status === 'verified')
    return vehicles.filter((item) => item.brtc_status === 'rejected')
  }, [filter, vehicles])

  const pendingCount = vehicles.filter((item) => item.brtc_status === 'pending_manual').length

  const handleApprove = async (vehicleId: string) => {
    try {
      await adminApproveVehicleFn({ vehicleId })
      toast.success('Vehicle approved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Approval failed')
    }
  }

  const handleReject = async () => {
    if (!rejecting || !rejectReason.trim()) return

    try {
      await adminRejectVehicleFn({
        vehicleId: rejecting.id,
        reason: rejectReason.trim(),
      })
      toast.success('Vehicle rejected')
      setRejecting(null)
      setRejectReason('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reject failed')
    }
  }

  const tabClass = (key: Filter) =>
    `rounded-full px-3 py-1.5 text-sm font-semibold ${
      filter === key ? 'bg-[#006A4E] text-white' : 'bg-slate-100 text-slate-600'
    }`

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={tabClass('all')}>
          সব
        </button>
        <button onClick={() => setFilter('pending')} className={tabClass('pending')}>
          অপেক্ষমান ({pendingCount})
        </button>
        <button onClick={() => setFilter('approved')} className={tabClass('approved')}>
          অনুমোদিত
        </button>
        <button onClick={() => setFilter('rejected')} className={tabClass('rejected')}>
          প্রত্যাখ্যাত
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((vehicle) => (
          <div
            key={vehicle.id}
            className="grid grid-cols-1 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[120px,1fr,auto]"
          >
            <div className="h-20 w-28 overflow-hidden rounded-lg bg-slate-100">
              {vehicle.registration_doc_url ? (
                <img
                  src={vehicle.registration_doc_url}
                  alt={vehicle.plate_number}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">No doc</div>
              )}
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">{vehicle.plate_number}</p>
              <p className="text-sm text-slate-600">
                {vehicle.vehicle_type} • {vehicle.make || '-'} {vehicle.model || ''}
              </p>
              <p className="text-xs text-slate-400">Status: {vehicle.brtc_status}</p>
            </div>

            <div className="flex gap-2">
              {vehicle.brtc_status === 'pending_manual' && (
                <>
                  <button
                    onClick={() => handleApprove(vehicle.id)}
                    className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    ✓ অনুমোদন
                  </button>
                  <button
                    onClick={() => setRejecting(vehicle)}
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    ✗ প্রত্যাখ্যান
                  </button>
                </>
              )}
              <button
                onClick={() => setDetailVehicle(vehicle)}
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                বিস্তারিত দেখুন
              </button>
            </div>
          </div>
        ))}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">Rejection reason</h4>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              className="mt-3 h-28 w-full rounded-lg border border-slate-300 p-2"
              placeholder="Enter rejection reason"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejecting(null)}
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Submit Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {detailVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h4 className="text-lg font-bold text-slate-900">Vehicle Details</h4>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="font-semibold">Plate:</span> {detailVehicle.plate_number}</p>
              <p><span className="font-semibold">Type:</span> {detailVehicle.vehicle_type}</p>
              <p><span className="font-semibold">Make/Model:</span> {detailVehicle.make || '-'} {detailVehicle.model || ''}</p>
              <p><span className="font-semibold">Owner UID:</span> {detailVehicle.owner_uid}</p>
              <p><span className="font-semibold">Status:</span> {detailVehicle.brtc_status}</p>
            </div>
            {detailVehicle.registration_doc_url && (
              <img
                src={detailVehicle.registration_doc_url}
                alt={detailVehicle.plate_number}
                className="mt-3 max-h-72 w-full rounded-lg border border-slate-200 object-contain"
              />
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setDetailVehicle(null)}
                className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
