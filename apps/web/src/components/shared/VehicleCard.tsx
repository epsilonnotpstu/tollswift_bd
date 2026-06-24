import { Bike, Bus, Car, Truck, BusFront } from 'lucide-react';
import { Vehicle } from '@/types/vehicle.types';
import { cn } from '@/components/ui/utils';
import { formatBDT } from '@/utils/format';
import { StatusBadge } from './StatusBadge';

interface VehicleCardProps {
  vehicle: Vehicle;
  onTap?: () => void;
  isSelected?: boolean;
  showStatus?: boolean;
  showTollAmount?: number;
}

const iconMap = {
  MOTORBIKE: Bike,
  CAR: Car,
  MICROBUS: BusFront,
  BUS: Bus,
  TRUCK: Truck,
  HEAVY_TRUCK: Truck
};

export const VehicleCard = ({ vehicle, onTap, isSelected, showStatus = true, showTollAmount }: VehicleCardProps) => {
  const Icon = iconMap[vehicle.vehicleType] ?? Car;
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn('flex w-full items-center gap-3 rounded-app border bg-surface p-4 text-left shadow-sm transition active:scale-[0.99]', isSelected ? 'border-primary bg-primary-50' : 'border-border')}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-sm font-bold text-text-primary">{vehicle.registrationNumber}</span>
        <span className="mt-0.5 block truncate text-xs text-text-secondary">{vehicle.ownerName} · Category {vehicle.vehicleCategory}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          {showStatus ? <StatusBadge status={vehicle.status} size="sm" /> : null}
          {showTollAmount !== undefined ? <span className="text-xs font-bold text-primary">{formatBDT(showTollAmount)}</span> : null}
        </span>
      </span>
    </button>
  );
};
