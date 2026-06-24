import { MapPin } from 'lucide-react';
import { Bridge } from '@/types/bridge.types';
import { cn } from '@/components/ui/utils';
import { formatBDT } from '@/utils/format';
import { StatusBadge } from './StatusBadge';

interface BridgeCardProps {
  bridge: Bridge;
  tollRate?: number;
  onTap?: () => void;
  isSelected?: boolean;
}

export const BridgeCard = ({ bridge, tollRate, onTap, isSelected }: BridgeCardProps) => (
  <button
    type="button"
    onClick={onTap}
    className={cn('flex w-full items-center gap-3 rounded-app border bg-surface p-3 text-left shadow-sm transition active:scale-[0.99]', isSelected ? 'border-primary bg-primary-50' : 'border-border')}
  >
    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-app bg-gradient-to-br from-primary-50 to-green-50">
      {bridge.imageUrl ? <img src={bridge.imageUrl} alt={bridge.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl">🌉</div>}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="truncate font-bengali text-sm font-bold text-text-primary">{bridge.nameBn}</p>
          <p className="truncate text-xs text-text-secondary">{bridge.name}</p>
        </div>
        <StatusBadge status={bridge.status} size="sm" />
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
        <MapPin className="h-3 w-3" /> {bridge.district}
      </p>
      {tollRate !== undefined ? <p className="mt-1 text-xs font-bold text-primary">{formatBDT(tollRate)}</p> : null}
    </div>
  </button>
);

