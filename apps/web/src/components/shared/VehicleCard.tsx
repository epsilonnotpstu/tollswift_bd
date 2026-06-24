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
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left shadow-sm transition active:scale-[0.98]',
        isSelected ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'border-border/60 hover:border-border'
      )}
    >
      <span className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
        isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
      )}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-sm font-bold text-text-primary">{vehicle.registrationNumber}</span>
        <span className="mt-0.5 block truncate text-xs text-text-muted">{vehicle.ownerName}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          {showStatus && <StatusBadge status={vehicle.status} size="sm" />}
          {showTollAmount !== undefined && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{formatBDT(showTollAmount)}</span>
          )}
        </span>
      </span>
      {isSelected && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
      )}
    </button>
  );
};
