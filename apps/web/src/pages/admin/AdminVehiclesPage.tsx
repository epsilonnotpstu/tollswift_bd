import { useState } from 'react';
import { AlertTriangle, Check, Clock, Search, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllVehicles, getPendingVehicles, verifyVehicle } from '@/api/admin.api';
import { Vehicle } from '@/types/vehicle.types';
import { formatDateTime } from '@/utils/format';

const CATEGORY_LABEL: Record<string, string> = {
  A: 'Motorbike', B: 'Car', C: 'Microbus', D: 'Bus', E: 'Small Truck', F: 'Heavy Truck'
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  VERIFIED: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' }
};

const TABS = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
type Tab = typeof TABS[number];

const VehicleCard = ({ v, onAction }: { v: Vehicle; onAction: (v: Vehicle) => void }) => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cfg = statusConfig[v.status] ?? statusConfig.PENDING;
  const photos = [v.frontPhotoUrl, v.backPhotoUrl].filter(Boolean) as string[];

  return (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold text-gray-900">{v.registrationNumber}</p>
            <p className="text-xs text-gray-500">{v.vehicleType} · {CATEGORY_LABEL[v.vehicleCategory] ?? v.vehicleCategory}</p>
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-gray-400">Owner</p>
            <p className="font-semibold text-gray-800 truncate">{v.owner?.fullName ?? v.ownerName ?? '—'}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-gray-400">BRTA</p>
            <p className="font-semibold text-gray-800">{v.brtaCertNumber ?? '—'}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-gray-400">BRTA Status</p>
            <p className={`font-bold ${v.brtaVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
              {v.brtaVerified ? '✓ Verified' : 'Manual'}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2">
            <p className="text-gray-400">Registered</p>
            <p className="font-semibold text-gray-800">{formatDateTime(v.createdAt)}</p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="vehicle"
                onClick={() => setLightbox(url)}
                className="h-16 w-24 shrink-0 cursor-pointer rounded-xl object-cover hover:opacity-90 transition"
              />
            ))}
          </div>
        )}

        {v.status === 'PENDING' && (
          <button
            onClick={() => onAction(v)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition"
          >
            <AlertTriangle className="h-4 w-4" /> Review & Verify
          </button>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="vehicle" className="max-h-[80vh] max-w-full rounded-xl shadow-2xl" />
        </div>
      )}
    </>
  );
};

export const AdminVehiclesPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pendingVehicles, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-vehicles-pending'],
    queryFn: getPendingVehicles
  });

  const { data: allVehicles, isLoading: allLoading } = useQuery({
    queryKey: ['admin-vehicles', activeTab],
    queryFn: () => getAllVehicles({ status: activeTab }),
    enabled: activeTab !== 'PENDING'
  });

  const verifyMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) =>
      verifyVehicle(id, { action, rejectionReason: action === 'REJECT' ? rejectReason : undefined }),
    onSuccess: (_, vars) => {
      toast.success(`Vehicle ${vars.action === 'APPROVE' ? 'approved ✓' : 'rejected'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedVehicle(null);
      setRejectReason('');
    },
    onError: () => toast.error('Action failed')
  });

  const vehicles = activeTab === 'PENDING' ? pendingVehicles : allVehicles;
  const isLoading = activeTab === 'PENDING' ? pendingLoading : allLoading;
  const filtered = (vehicles ?? []).filter((v) =>
    !search || v.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl bg-white p-1 shadow-sm border border-gray-100">
          {TABS.map((t) => {
            const count = t === 'PENDING' ? (pendingVehicles?.length ?? 0) : undefined;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === t ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {t}
                {count !== undefined && count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === t ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate…"
            className="rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
          <Clock className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-400">{activeTab === 'PENDING' ? 'No pending vehicles — all clear!' : 'No vehicles found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => <VehicleCard key={v.id} v={v} onAction={setSelectedVehicle} />)}
        </div>
      )}

      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-base font-bold text-gray-900">Review Vehicle</h2>
            <p className="mt-1 text-sm text-gray-500">{selectedVehicle.registrationNumber} · {CATEGORY_LABEL[selectedVehicle.vehicleCategory]}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">Owner</p>
                <p className="font-semibold">{(selectedVehicle.owner as { fullName?: string })?.fullName ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">BRTA Auto-Verified</p>
                <p className={`font-bold ${selectedVehicle.brtaVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedVehicle.brtaVerified ? 'Yes' : 'No — manual review'}
                </p>
              </div>
            </div>

            {[selectedVehicle.frontPhotoUrl, selectedVehicle.backPhotoUrl].filter(Boolean).length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {([selectedVehicle.frontPhotoUrl, selectedVehicle.backPhotoUrl].filter(Boolean) as string[]).map((url, i) => (
                  <a href={url} target="_blank" rel="noreferrer" key={i}>
                    <img src={url} alt="" className="h-20 w-28 rounded-xl object-cover hover:opacity-90 transition" />
                  </a>
                ))}
              </div>
            )}

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (optional)"
              rows={2}
              className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <div className="mt-4 flex gap-3">
              <button onClick={() => setSelectedVehicle(null)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={() => verifyMut.mutate({ id: selectedVehicle.id, action: 'REJECT' })}
                disabled={verifyMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => verifyMut.mutate({ id: selectedVehicle.id, action: 'APPROVE' })}
                disabled={verifyMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
