import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBridge } from '@/api/bridge.api';
import { getMyVehicles } from '@/api/vehicle.api';
import { AmountDisplay, AppBar, EmptyState, VehicleCard } from '@/components/shared';
import { useUIStore } from '@/store/uiStore';
import { useWallet } from '@/hooks/useWallet';
import { getRateForCategory } from './helpers';

export const SelectVehiclePage = () => {
  const navigate = useNavigate();
  const { selectedBridgeId, setTollSelection } = useUIStore();
  const wallet = useWallet();
  const bridge = useQuery({ queryKey: ['bridge', selectedBridgeId], queryFn: () => getBridge(selectedBridgeId!), enabled: Boolean(selectedBridgeId) });
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: getMyVehicles });
  const verified = (vehicles.data ?? []).filter((vehicle) => vehicle.status === 'VERIFIED');

  return (
    <main className="min-h-screen bg-bg pb-32">
      <AppBar title="Select Vehicle" titleBn="যানবাহন বেছে নিন" showBack subtitle={bridge.data?.nameBn} />
      <section className="space-y-3 px-5 py-5">
        {vehicles.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />)}
          </div>
        ) : verified.length ? (
          verified.map((vehicle) => {
            const amount = getRateForCategory(bridge.data?.tollRate, vehicle.vehicleCategory);
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                showTollAmount={amount}
                onTap={() => { setTollSelection(undefined, vehicle.id, undefined); navigate('/toll/method'); }}
              />
            );
          })
        ) : (
          <EmptyState
            title="No verified vehicle"
            titleBn="অনুমোদিত গাড়ি নেই"
            description="Admin approval is required before toll payment."
            descriptionBn="টোল পেমেন্টের আগে admin approval লাগবে।"
            icon={<span className="text-4xl">🚗</span>}
          />
        )}
      </section>

      {/* Wallet footer */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border/50 bg-surface/95 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bengali text-xs text-text-muted">ওয়ালেট ব্যালেন্স</p>
            <AmountDisplay amount={wallet.balance} size="md" colored className="mt-0.5" />
          </div>
          <button
            onClick={() => navigate('/wallet/deposit')}
            className="rounded-full bg-primary/10 px-4 py-2 font-bengali text-xs font-bold text-primary"
          >
            টাকা যোগ করুন
          </button>
        </div>
      </div>
    </main>
  );
};

