import { TollRate } from '@/types/bridge.types';
import { VehicleCategory } from '@/types/vehicle.types';

export const getRateForCategory = (rate: TollRate | null | undefined, category: VehicleCategory) => {
  if (!rate) return 0;
  return rate[`rate${category}` as keyof Pick<TollRate, 'rateA' | 'rateB' | 'rateC' | 'rateD' | 'rateE' | 'rateF'>] as number;
};

