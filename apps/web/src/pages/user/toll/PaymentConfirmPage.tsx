import { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getBridge } from '@/api/bridge.api';
import { payToll } from '@/api/toll.api';
import { getVehicle } from '@/api/vehicle.api';
import { AmountDisplay, AppBar } from '@/components/shared';
import { useUIStore } from '@/store/uiStore';
import { getRateForCategory } from './helpers';

export const PaymentConfirmPage = () => {
  const navigate = useNavigate();
  const { selectedBridgeId, selectedVehicleId, selectedPaymentMethod } = useUIStore();
  const bridge = useQuery({ queryKey: ['bridge', selectedBridgeId], queryFn: () => getBridge(selectedBridgeId!), enabled: Boolean(selectedBridgeId) });
  const vehicle = useQuery({ queryKey: ['vehicle', selectedVehicleId], queryFn: () => getVehicle(selectedVehicleId!), enabled: Boolean(selectedVehicleId) });
  const amount = useMemo(() => getRateForCategory(bridge.data?.tollRate, vehicle.data?.vehicleCategory ?? 'A'), [bridge.data, vehicle.data]);
  const mutation = useMutation({
    mutationFn: () => payToll({ bridgeId: selectedBridgeId!, vehicleId: selectedVehicleId!, method: selectedPaymentMethod as never }),
    onSuccess: (data) => {
      if (data.gatewayUrl) window.location.href = data.gatewayUrl;
      else navigate(`/toll/success?txId=${data.transactionId}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Payment failed')
  });

  return (
    <main className="min-h-screen bg-bg pb-6">
      <AppBar title="Confirm" titleBn="পেমেন্ট নিশ্চিত করুন" showBack />
      <section className="space-y-4 px-5 py-5">
        {/* Amount hero */}
        <div className="rounded-3xl bg-primary px-5 py-6 text-center text-white shadow-xl shadow-primary/30">
          <p className="font-bengali text-xs font-medium text-white/60">পরিশোধযোগ্য পরিমাণ</p>
          <AmountDisplay amount={amount} size="xl" className="mt-1 text-white" />
        </div>

        {/* Detail card */}
        <div className="rounded-2xl border border-border/60 bg-surface shadow-sm overflow-hidden">
          {[
            ['সেতু', bridge.data?.nameBn ?? '—'],
            ['গাড়ি', vehicle.data?.registrationNumber ?? '—'],
            ['পদ্ধতি', selectedPaymentMethod ?? '—'],
            ['সময়', new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })]
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 px-4 py-3 text-sm last:border-b-0">
              <span className="font-bengali text-text-muted">{label}</span>
              <span className="font-semibold text-text-primary">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5">
          <Shield className="h-4 w-4 text-emerald-600" />
          <p className="font-bengali text-xs font-medium text-emerald-700">128-bit SSL সুরক্ষিত পেমেন্ট</p>
        </div>

        <button
          disabled={mutation.isPending || !selectedBridgeId || !selectedVehicleId || !selectedPaymentMethod}
          onClick={() => mutation.mutate()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition"
        >
          {mutation.isPending ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> প্রক্রিয়াকরণ...</>
          ) : (
            'পরিশোধ করুন'
          )}
        </button>
      </section>
    </main>
  );
};

