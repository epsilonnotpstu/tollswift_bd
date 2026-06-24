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
    <main className="min-h-screen bg-bg pb-28">
      <AppBar title="Select Vehicle" titleBn="যানবাহন বেছে নিন" showBack subtitle={bridge.data?.nameBn} />
      <section className="space-y-3 px-5 py-5">
        {verified.length ? verified.map((vehicle) => {
          const amount = getRateForCategory(bridge.data?.tollRate, vehicle.vehicleCategory);
          return <VehicleCard key={vehicle.id} vehicle={vehicle} showTollAmount={amount} onTap={() => { setTollSelection(undefined, vehicle.id, undefined); navigate('/toll/method'); }} />;
        }) : (
          <EmptyState title="No verified vehicle" titleBn="অনুমোদিত গাড়ি নেই" description="Admin approval is required before toll payment." descriptionBn="টোল পেমেন্টের আগে admin approval লাগবে।" icon={<span className="text-3xl">🚗</span>} />
        )}
      </section>
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="font-bengali text-sm text-text-secondary">Wallet balance</span>
          <AmountDisplay amount={wallet.balance} colored />
        </div>
      </div>
    </main>
  );
};

