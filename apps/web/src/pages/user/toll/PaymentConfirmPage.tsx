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
    <main className="min-h-screen bg-bg">
      <AppBar title="Confirm" titleBn="পেমেন্ট নিশ্চিত করুন" showBack />
      <section className="space-y-5 px-5 py-5">
        <div className="rounded-app border-l-4 border-primary bg-surface p-5 shadow-sm">
          {[
            ['সেতু', bridge.data?.nameBn],
            ['গাড়ি', vehicle.data?.registrationNumber],
            ['পদ্ধতি', selectedPaymentMethod],
            ['সময়', new Date().toLocaleString('bn-BD')]
          ].map(([label, value]) => <div key={String(label)} className="flex justify-between border-b border-border py-3 text-sm"><span className="font-bengali text-text-secondary">{label}</span><span className="font-semibold">{value}</span></div>)}
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bengali font-bold">মোট</span>
            <AmountDisplay amount={amount} size="lg" colored />
          </div>
        </div>
        <p className="flex items-center justify-center gap-2 font-bengali text-xs text-text-secondary"><Shield className="h-4 w-4 text-secondary" /> 128-bit SSL সুরক্ষিত পেমেন্ট</p>
        <button disabled={mutation.isPending || !selectedBridgeId || !selectedVehicleId || !selectedPaymentMethod} onClick={() => mutation.mutate()} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white disabled:opacity-50">
          {mutation.isPending ? 'প্রক্রিয়াকরণ...' : 'পরিশোধ করুন'}
        </button>
      </section>
    </main>
  );
};

