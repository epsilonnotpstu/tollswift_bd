import { useState } from 'react';
import { Building2, Edit, MapPin, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getBridges, updateBridge, updateTollRates } from '@/api/admin.api';
import { Bridge, BridgeStatus } from '@/types/bridge.types';
import { formatBDT } from '@/utils/format';

const STATUS_COLOR: Record<BridgeStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700',
  MAINTENANCE: 'bg-amber-50 text-amber-700',
  CLOSED: 'bg-red-50 text-red-700'
};

type BridgeWithRate = Bridge & { tollRate?: { rateA: number; rateB: number; rateC: number; rateD: number; rateE: number; rateF: number } | null };

const RatesModal = ({ bridge, onClose }: { bridge: BridgeWithRate; onClose: () => void }) => {
  const [rates, setRates] = useState({
    rateA: bridge.tollRate?.rateA ?? 0,
    rateB: bridge.tollRate?.rateB ?? 0,
    rateC: bridge.tollRate?.rateC ?? 0,
    rateD: bridge.tollRate?.rateD ?? 0,
    rateE: bridge.tollRate?.rateE ?? 0,
    rateF: bridge.tollRate?.rateF ?? 0
  });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => updateTollRates(bridge.id, rates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-bridges'] });
      toast.success('Toll rates updated');
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed')
  });

  const labels: Record<keyof typeof rates, string> = {
    rateA: 'A · Motorbike',
    rateB: 'B · Car',
    rateC: 'C · Microbus',
    rateD: 'D · Bus',
    rateE: 'E · Small Truck',
    rateF: 'F · Heavy Truck'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-bold text-text-primary">{bridge.nameBn}</h2>
            <p className="text-xs text-text-secondary">Update toll rates (paisa)</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          {(Object.keys(rates) as Array<keyof typeof rates>).map((key) => (
            <label key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-text-secondary">{labels[key]}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={rates[key]}
                  onChange={(e) => setRates((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-24 rounded-lg border border-border bg-gray-50 px-3 py-1.5 text-right text-sm font-bold outline-none focus:border-primary"
                />
                <span className="text-xs text-text-muted">p</span>
              </div>
            </label>
          ))}
        </div>
        <div className="border-t p-5">
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            Save Rates
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminBridgesPage = () => {
  const [selected, setSelected] = useState<BridgeWithRate | null>(null);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['admin-bridges'], queryFn: getBridges });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BridgeStatus }) =>
      updateBridge(id, { status: status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-bridges'] });
      toast.success('Bridge status updated');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed')
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Bridges</h1>
          <p className="text-sm text-text-secondary">{query.data?.length ?? 0} bridges</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {query.isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-gray-50" />
            ))}
          </div>
        ) : (query.data ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 font-bold text-text-primary">No bridges found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3">Bridge</th>
                <th className="hidden px-4 py-3 md:table-cell">Category</th>
                <th className="hidden px-4 py-3 lg:table-cell">Car Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Rates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(query.data as BridgeWithRate[]).map((bridge) => (
                <tr key={bridge.id} className="hover:bg-gray-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-primary">{bridge.nameBn}</p>
                    <p className="flex items-center gap-1 text-xs text-text-muted">
                      <MapPin className="h-3 w-3" /> {bridge.district}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-text-secondary md:table-cell">{bridge.category}</td>
                  <td className="hidden px-4 py-3 text-text-secondary lg:table-cell">
                    {bridge.tollRate ? formatBDT(bridge.tollRate.rateB) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={toggleStatus.isPending}
                      onClick={() => toggleStatus.mutate({ id: bridge.id, status: bridge.status })}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition ${STATUS_COLOR[bridge.status]}`}
                    >
                      {bridge.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(bridge)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      <Edit className="h-3.5 w-3.5" /> Rates
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected ? <RatesModal bridge={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
};
