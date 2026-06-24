import { useEffect, useState } from 'react';
import { CheckCircle, MapPin, Pencil, Plus, Settings2, Wrench, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createBridge, setBridgeStatus, updateTollRates } from '@/api/admin.api';
import { getBridges } from '@/api/bridge.api';
import { BridgeWithRate } from '@/api/bridge.api';
import { BridgeCategory, BridgeStatus } from '@/types/bridge.types';

const CATEGORIES: BridgeCategory[] = ['EXPRESSWAY', 'NATIONAL', 'LOCAL'];
const STATUSES: BridgeStatus[] = ['ACTIVE', 'MAINTENANCE', 'CLOSED'];
const VEHICLE_LABELS = ['A (Motorbike)', 'B (Car)', 'C (Microbus)', 'D (Bus)', 'E (Sm. Truck)', 'F (Hv. Truck)'];

const statusConfig: Record<BridgeStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' },
  MAINTENANCE: { label: 'Maintenance', cls: 'bg-amber-100 text-amber-700' },
  CLOSED: { label: 'Closed', cls: 'bg-red-100 text-red-700' }
};

const EMPTY_BRIDGE = {
  name: '', nameBn: '', location: '', district: '', latitude: 0, longitude: 0,
  category: 'NATIONAL' as BridgeCategory, status: 'ACTIVE' as BridgeStatus,
  authorityName: 'Bangladesh Bridge Authority', hasFastpass: false, imageUrl: ''
};

const EMPTY_RATES = { rateA: 0, rateB: 0, rateC: 0, rateD: 0, rateE: 0, rateF: 0 };

export const AdminBridgesPage = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<BridgeWithRate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [rateEditing, setRateEditing] = useState(false);
  const [bridgeForm, setBridgeForm] = useState(EMPTY_BRIDGE);
  const [rates, setRates] = useState(EMPTY_RATES);
  const [categoryFilter, setCategoryFilter] = useState<BridgeCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<BridgeStatus | ''>('');

  const { data: bridges, isLoading } = useQuery({ queryKey: ['bridges'], queryFn: () => getBridges() });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BridgeStatus }) => setBridgeStatus(id, status),
    onSuccess: (updated) => {
      toast.success('Status updated');
      setSelected(updated as BridgeWithRate);
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
    }
  });

  const rateMut = useMutation({
    mutationFn: () => updateTollRates(selected!.id, rates),
    onSuccess: () => {
      toast.success('Rates saved');
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
      setRateEditing(false);
    }
  });

  const createMut = useMutation({
    mutationFn: () => createBridge(bridgeForm as Parameters<typeof createBridge>[0]),
    onSuccess: () => {
      toast.success('Bridge created');
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
      setShowAddModal(false);
      setBridgeForm(EMPTY_BRIDGE);
    }
  });

  useEffect(() => {
    if (selected?.tollRate) {
      setRates({
        rateA: selected.tollRate.rateA,
        rateB: selected.tollRate.rateB,
        rateC: selected.tollRate.rateC,
        rateD: selected.tollRate.rateD,
        rateE: selected.tollRate.rateE,
        rateF: selected.tollRate.rateF
      });
    }
  }, [selected]);

  const filtered = (bridges ?? []).filter((b) =>
    (!categoryFilter || b.category === categoryFilter) &&
    (!statusFilter || b.status === statusFilter)
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Bridge list */}
      <div className="flex flex-col gap-3 lg:w-80 xl:w-96">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as BridgeCategory | '')}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm outline-none focus:border-primary">
            <option value="">All Types</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BridgeStatus | '')}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm outline-none focus:border-primary">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setShowAddModal(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm hover:bg-primary/90 transition">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white shadow-sm" />)
          ) : filtered.map((b) => {
            const sc = statusConfig[b.status];
            return (
              <button
                key={b.id}
                onClick={() => { setSelected(b); setRateEditing(false); }}
                className={`w-full rounded-xl p-4 text-left shadow-sm transition hover:shadow-md ${selected?.id === b.id ? 'ring-2 ring-primary bg-primary/5' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{b.name}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{b.district}</span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${sc.cls}`}>{sc.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="flex-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                <p className="font-bengali text-sm text-gray-400">{selected.nameBn}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig[selected.status].cls}`}>{selected.status}</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{selected.category}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['Location', selected.location], ['District', selected.district],
                ['Authority', selected.authorityName], ['FastPass', selected.hasFastpass ? 'Yes' : 'No'],
                ['Lat', selected.latitude.toFixed(4)], ['Lon', selected.longitude.toFixed(4)]
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-900">{val}</p>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-bold text-gray-700">Change Status</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMut.mutate({ id: selected.id, status: s })}
                    disabled={selected.status === s || statusMut.isPending}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selected.status === s ? 'bg-primary text-white cursor-default' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s === 'ACTIVE' ? <><CheckCircle className="mr-1 inline h-3.5 w-3.5" />{s}</> : s === 'MAINTENANCE' ? <><Wrench className="mr-1 inline h-3.5 w-3.5" />{s}</> : <><XCircle className="mr-1 inline h-3.5 w-3.5" />{s}</>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-gray-700">Toll Rates (Taka)</p>
                <button
                  onClick={() => setRateEditing((v) => !v)}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  {rateEditing ? <><XCircle className="h-3.5 w-3.5" /> Cancel</> : <><Pencil className="h-3.5 w-3.5" /> Edit Rates</>}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((cat, i) => (
                  <div key={cat} className="rounded-xl border border-gray-100 p-3">
                    <p className="mb-1 text-xs text-gray-400">{VEHICLE_LABELS[i]}</p>
                    {rateEditing ? (
                      <input
                        type="number"
                        value={rates[`rate${cat}`]}
                        onChange={(e) => setRates((r) => ({ ...r, [`rate${cat}`]: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-primary/40 bg-primary/5 px-2 py-1 text-sm font-bold text-primary outline-none"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-900">
                        ৳{((selected.tollRate?.[`rate${cat}` as keyof typeof selected.tollRate] as number ?? 0) / 100).toFixed(0)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {rateEditing && (
                <button onClick={() => rateMut.mutate()} disabled={rateMut.isPending}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90 transition disabled:opacity-50">
                  <Settings2 className="h-4 w-4" /> {rateMut.isPending ? 'Saving…' : 'Save Rates'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
          <div className="text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">Select a bridge to view details</p>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="mb-4 font-bold text-gray-900">Add New Bridge</h2>
            <div className="space-y-3">
              {([['Name (English)', 'name'], ['Name (Bengali)', 'nameBn'], ['Location', 'location'], ['District', 'district'], ['Authority', 'authorityName']] as [string, string][]).map(([label, field]) => (
                <input key={field} placeholder={label} value={(bridgeForm as Record<string, unknown>)[field] as string}
                  onChange={(e) => setBridgeForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              ))}
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Latitude" value={bridgeForm.latitude}
                  onChange={(e) => setBridgeForm((f) => ({ ...f, latitude: Number(e.target.value) }))}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                <input type="number" placeholder="Longitude" value={bridgeForm.longitude}
                  onChange={(e) => setBridgeForm((f) => ({ ...f, longitude: Number(e.target.value) }))}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={bridgeForm.category} onChange={(e) => setBridgeForm((f) => ({ ...f, category: e.target.value as BridgeCategory }))}
                  className="rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-primary">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 cursor-pointer">
                  <input type="checkbox" checked={bridgeForm.hasFastpass}
                    onChange={(e) => setBridgeForm((f) => ({ ...f, hasFastpass: e.target.checked }))} />
                  <span className="text-sm text-gray-700">FastPass Enabled</span>
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => createMut.mutate()} disabled={!bridgeForm.name || createMut.isPending}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-50">
                {createMut.isPending ? 'Creating…' : 'Create Bridge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
