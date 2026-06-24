import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBridge } from '@/api/bridge.api';
import { getVehicle } from '@/api/vehicle.api';
import { AmountDisplay, AppBar, PaymentMethodCard } from '@/components/shared';
import { PaymentMethod } from '@/types/transaction.types';
import { useUIStore } from '@/store/uiStore';
import { useWallet } from '@/hooks/useWallet';
import { getRateForCategory } from './helpers';

export const PaymentMethodPage = () => {
  const navigate = useNavigate();
  const { selectedBridgeId, selectedVehicleId, selectedPaymentMethod, setTollSelection } = useUIStore();
  const wallet = useWallet();
  const bridge = useQuery({ queryKey: ['bridge', selectedBridgeId], queryFn: () => getBridge(selectedBridgeId!), enabled: Boolean(selectedBridgeId) });
  const vehicle = useQuery({ queryKey: ['vehicle', selectedVehicleId], queryFn: () => getVehicle(selectedVehicleId!), enabled: Boolean(selectedVehicleId) });
  const amount = useMemo(() => getRateForCategory(bridge.data?.tollRate, vehicle.data?.vehicleCategory ?? 'A'), [bridge.data, vehicle.data]);

  return (
    <main className="min-h-screen bg-bg pb-6">
      <AppBar title="Payment Method" titleBn="পেমেন্ট পদ্ধতি" showBack />
      <section className="space-y-4 px-5 py-5">
        <div className="rounded-app border border-border bg-surface p-4 shadow-sm">
          <p className="font-bengali text-sm font-bold">পেমেন্টের বিবরণ</p>
          <div className="mt-3 space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-text-secondary">সেতু</span><span>{bridge.data?.nameBn}</span></p>
            <p className="flex justify-between"><span className="text-text-secondary">গাড়ি</span><span>{vehicle.data?.registrationNumber}</span></p>
            <p className="flex justify-between font-bold"><span>মোট</span><AmountDisplay amount={amount} colored /></p>
          </div>
        </div>
        {(['WALLET', 'SSLCOMMERZ', 'BKASH', 'NAGAD'] as PaymentMethod[]).map((method) => (
          <PaymentMethodCard key={method} method={method} balance={method === 'WALLET' ? wallet.balance : undefined} isDisabled={method === 'WALLET' && wallet.balance < amount} isSelected={selectedPaymentMethod === method} onClick={() => setTollSelection(undefined, undefined, method)} />
        ))}
        <button disabled={!selectedPaymentMethod} onClick={() => navigate('/toll/confirm')} className="w-full rounded-app bg-primary py-4 font-bengali font-bold text-white disabled:opacity-50">নিশ্চিত করুন</button>
      </section>
    </main>
  );
};

