import { useState } from 'react';
import { AlertTriangle, Check, Clock, Search, X, ZoomIn, Car } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllVehicles, getPendingVehicles, verifyVehicle } from '@/api/admin.api';
import { Vehicle } from '@/types/vehicle.types';
import { formatDateTime } from '@/utils/format';

const API_ORIGIN = (import.meta.env.VITE_API_URL as string ?? '').replace(/\/api\/v1\/?$/, '');

const photoUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
};

const CATEGORY_LABEL: Record<string, string> = {
  A: 'Motorbike', B: 'Car', C: 'Microbus', D: 'Bus', E: 'Small Truck', F: 'Heavy Truck'
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  VERIFIED: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const TABS = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
type Tab = typeof TABS[number];

const PhotoStrip = ({ front, back, onZoom }: { front?: string | null; back?: string | null; onZoom: (url: string) => void }) => {
  const urls = [photoUrl(front), photoUrl(back)].filter(Boolean) as string[];
  if (urls.length === 0) return (
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
      <Car className="h-4 w-4 text-gray-300" />
      <span className="text-xs text-gray-400">No photos uploaded</span>
    </div>
  );
  return (
    <div className="mt-3 flex gap-2">
      {urls.map((url, i) => (
        <div key={i} className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-gray-100">
          <img src={url} alt={i === 0 ? 'Front' : 'Back'} className="h-full w-full object-cover transition group-hover:scale-105" />
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/60 to-transparent pb-1">
            <span className="text-[10px] font-bold text-white">{i === 0 ? 'সামনে' : 'পেছনে'}</span>
          </div>
          <button
            type="button"
            onClick={() => onZoom(url)}
            className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
          >
            <ZoomIn className="h-6 w-6 text-white drop-shadow" />
          </button>
        </div>
      ))}
    </div>
  );
};

const VehicleCard = ({ v, onAction }: { v: Vehicle; onAction: (v: Vehicle) => void }) => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cfg = statusConfig[v.status] ?? statusConfig.PENDING;

  return (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-mono text-base font-bold text-gray-900">{v.registrationNumber}</p>
            <p className="text-xs text-gray-400">{v.vehicleType} · Cat {v.vehicleCategory} — {CATEGORY_LABEL[v.vehicleCategory] ?? ''}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.cls}`}>{cfg.label}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-gray-400">মালিক</p>
            <p className="font-semibold text-gray-800 truncate">{v.owner?.fullName ?? v.ownerName ?? '—'}</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-gray-400">জমার তারিখ</p>
            <p className="font-semibold text-gray-800">{formatDateTime(v.createdAt)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-gray-400">BRTA</p>
            <p className={`font-bold ${v.brtaVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
              {v.brtaVerified ? '✓ Verified' : 'Manual review'}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-3 py-2">
            <p className="text-gray-400">জ্বালানি</p>
            <p className="font-semibold text-gray-800">{v.fuelType ?? '—'}</p>
          </div>
        </div>

        <PhotoStrip front={v.frontPhotoUrl} back={v.backPhotoUrl} onZoom={setLightbox} />

        {v.status === 'REJECTED' && v.rejectionReason && (
          <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            <span className="font-bold">Rejection: </span>{v.rejectionReason}
          </div>
        )}

        {v.status === 'PENDING' && (
          <button
            onClick={() => onAction(v)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white hover:bg-primary/90 active:scale-[0.98] transition"
          >
            <AlertTriangle className="h-4 w-4" /> Review & Verify
          </button>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="vehicle" className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl" />
          <button className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
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
  const [modalLightbox, setModalLightbox] = useState<string | null>(null);

  const { data: pendingVehicles = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-vehicles-pending'],
    queryFn: getPendingVehicles,
  });

  const { data: pagedVehicles, isLoading: allLoading } = useQuery({
    queryKey: ['admin-vehicles', activeTab],
    queryFn: () => getAllVehicles({ status: activeTab }),
    enabled: activeTab !== 'PENDING',
  });

  const verifyMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) =>
      verifyVehicle(id, { action, rejectionReason: action === 'REJECT' ? rejectReason : undefined }),
    onSuccess: (_, vars) => {
      toast.success(vars.action === 'APPROVE' ? 'Vehicle approved ✓' : 'Vehicle rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedVehicle(null);
      setRejectReason('');
    },
    onError: () => toast.error('Action failed — please try again'),
  });

  const vehicles: Vehicle[] = activeTab === 'PENDING' ? pendingVehicles : (pagedVehicles?.items ?? []);
  const isLoading = activeTab === 'PENDING' ? pendingLoading : allLoading;

  const filtered = vehicles.filter(
    (v) => !search || v.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const tabCount = (t: Tab) => t === 'PENDING' ? pendingVehicles.length : undefined;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
          {TABS.map((t) => {
            const count = tabCount(t);
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === t ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {t}
                {count !== undefined && count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === t ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>
                    {count}
                  </span>
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

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm ring-1 ring-gray-100">
          <Clock className="h-10 w-10 text-gray-200" />
          <p className="mt-3 text-sm font-medium text-gray-400">
            {activeTab === 'PENDING' ? 'কোনো pending গাড়ি নেই — সব clear!' : 'কোনো গাড়ি পাওয়া যায়নি'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard key={v.id} v={v} onAction={setSelectedVehicle} />
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">গাড়ি যাচাই</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {selectedVehicle.registrationNumber} · {CATEGORY_LABEL[selectedVehicle.vehicleCategory]}
                </p>
              </div>
              <button onClick={() => setSelectedVehicle(null)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">মালিক</p>
                <p className="font-semibold text-gray-800 truncate">
                  {(selectedVehicle.owner as { fullName?: string })?.fullName ?? selectedVehicle.ownerName ?? '—'}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-gray-400">BRTA Auto-check</p>
                <p className={`font-bold ${selectedVehicle.brtaVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedVehicle.brtaVerified ? '✓ Verified' : 'Manual review'}
                </p>
              </div>
            </div>

            <PhotoStrip
              front={selectedVehicle.frontPhotoUrl}
              back={selectedVehicle.backPhotoUrl}
              onZoom={setModalLightbox}
            />

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason (required to reject)"
              rows={2}
              className="mt-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                বাতিল
              </button>
              <button
                onClick={() => verifyMut.mutate({ id: selectedVehicle.id, action: 'REJECT' })}
                disabled={verifyMut.isPending || !rejectReason.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40 transition"
              >
                <X className="h-4 w-4" /> Reject
              </button>
              <button
                onClick={() => verifyMut.mutate({ id: selectedVehicle.id, action: 'APPROVE' })}
                disabled={verifyMut.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal lightbox */}
      {modalLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setModalLightbox(null)}
        >
          <img src={modalLightbox} alt="vehicle" className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl" />
          <button className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};
