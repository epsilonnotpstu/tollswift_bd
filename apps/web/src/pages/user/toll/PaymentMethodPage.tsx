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
      <section className="space-y-3.5 px-5 py-5">
        {/* Summary card */}
        <div className="rounded-2xl border border-border/60 bg-surface p-4 shadow-sm">
          <p className="font-bengali text-xs font-semibold text-text-muted mb-3">পেমেন্টের বিবরণ</p>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-bengali text-text-muted">সেতু</span>
              <span className="font-bengali font-semibold text-text-primary">{bridge.data?.nameBn ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bengali text-text-muted">গাড়ি</span>
              <span className="font-mono font-semibold text-text-primary">{vehicle.data?.registrationNumber ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
              <span className="font-bengali font-bold text-text-primary">মোট টোল</span>
              <AmountDisplay amount={amount} size="md" colored />
            </div>
          </div>
        </div>

        <p className="font-bengali text-xs font-semibold text-text-muted">পেমেন্ট পদ্ধতি বেছে নিন</p>

        {(['WALLET', 'SSLCOMMERZ', 'BKASH', 'NAGAD'] as PaymentMethod[]).map((method) => (
          <PaymentMethodCard
            key={method}
            method={method}
            balance={method === 'WALLET' ? wallet.balance : undefined}
            isDisabled={method === 'WALLET' && wallet.balance < amount}
            isSelected={selectedPaymentMethod === method}
            onClick={() => setTollSelection(undefined, undefined, method)}
          />
        ))}

        <button
          disabled={!selectedPaymentMethod}
          onClick={() => navigate('/toll/confirm')}
          className="w-full rounded-2xl bg-primary py-4 font-bengali font-bold text-white shadow-lg shadow-primary/25 disabled:opacity-50 active:scale-[0.98] transition"
        >
          নিশ্চিত করুন →
        </button>
      </section>
    </main>
  );
};

