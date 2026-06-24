import { useState } from 'react';
import { Check, ChevronRight, Clock, Filter, Search, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getPendingVehicles, verifyVehicle } from '@/api/admin.api';
import { Vehicle } from '@/types/vehicle.types';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  VERIFIED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700'
};

const CATEGORY_LABEL: Record<string, string> = {
  A: 'Motorbike', B: 'Car', C: 'Microbus', D: 'Bus', E: 'Small Truck', F: 'Heavy Truck'
};

const VehicleModal = ({
  vehicle,
  onClose
}: {
  vehicle: Vehicle;
  onClose: () => void;
}) => {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (action: 'APPROVE' | 'REJECT') =>
      verifyVehicle(vehicle.id, { action, rejectionReason: reason }),
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: ['admin-pending-vehicles'] });
      toast.success(action === 'APPROVE' ? 'Vehicle approved' : 'Vehicle rejected');
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Action failed')
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-bold text-text-primary">Vehicle Review</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-mono text-lg font-bold text-text-primary">{vehicle.registrationNumber}</p>
            <p className="mt-1 text-sm text-text-secondary">{vehicle.ownerName}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                {vehicle.vehicleType.replace('_', ' ')}
              </span>
              <span className="rounded-full bg-purple-50 px-2 py-1 font-semibold text-purple-700">
                Cat {vehicle.vehicleCategory} · {CATEGORY_LABEL[vehicle.vehicleCategory]}
              </span>
              {vehicle.fuelType ? (
                <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-600">
                  {vehicle.fuelType}
                </span>
              ) : null}
            </div>
          </div>
          {vehicle.frontPhotoUrl || vehicle.backPhotoUrl ? (
            <div className="grid grid-cols-2 gap-2">
              {[vehicle.frontPhotoUrl, vehicle.backPhotoUrl].map((src, i) =>
                src ? (
                  <img key={i} src={src} alt={i === 0 ? 'Front' : 'Back'} className="aspect-video w-full rounded-xl object-cover" />
                ) : (
                  <div key={i} className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 text-xs text-text-muted">
                    No photo
                  </div>
                )
              )}
            </div>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-text-secondary">Rejection Reason (required to reject)</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Explain why this vehicle is being rejected…"
              className="w-full resize-none rounded-xl border border-border bg-gray-50 p-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t p-5">
          <button
            disabled={mutation.isPending}
            onClick={() => {
              if (!reason.trim()) return toast.error('Rejection reason required');
              mutation.mutate('REJECT');
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 disabled:opacity-60"
          >
            <X className="h-4 w-4" /> Reject
          </button>
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate('APPROVE')}
            className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            <Check className="h-4 w-4" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminVehiclesPage = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const query = useQuery({ queryKey: ['admin-pending-vehicles'], queryFn: getPendingVehicles });
  const vehicles = (query.data ?? []).filter(
    (v) =>
      v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Vehicle Verification</h1>
          <p className="text-sm text-text-secondary">{query.data?.length ?? 0} pending approvals</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
          <Clock className="h-3.5 w-3.5" /> Pending
        </span>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by plate or owner…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {query.isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-16 text-center">
            <Check className="mx-auto h-12 w-12 text-green-400" />
            <p className="mt-3 font-bold text-text-primary">All vehicles reviewed</p>
            <p className="text-sm text-text-secondary">No pending approvals</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Owner</th>
                <th className="hidden px-4 py-3 md:table-cell">Type</th>
                <th className="hidden px-4 py-3 lg:table-cell">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3 font-mono text-xs font-bold">{v.registrationNumber}</td>
                  <td className="px-4 py-3 text-text-primary">{v.ownerName}</td>
                  <td className="hidden px-4 py-3 text-text-secondary md:table-cell">
                    {v.vehicleType.replace('_', ' ')}
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary lg:table-cell">
                    {v.vehicleCategory} · {CATEGORY_LABEL[v.vehicleCategory]}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_COLOR[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(v)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      Review <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected ? <VehicleModal vehicle={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
};
