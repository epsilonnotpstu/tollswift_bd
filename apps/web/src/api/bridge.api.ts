import { apiClient, unwrap } from './client';
import { Bridge, BridgeCategory, BridgeStatus, TollRate } from '@/types/bridge.types';
import { VehicleCategory } from '@/types/vehicle.types';

export interface BridgeFilters {
  category?: BridgeCategory;
  status?: BridgeStatus;
}

export type BridgeWithRate = Bridge & { tollRate?: TollRate | null };

export const getBridges = (filters?: BridgeFilters) => apiClient.get('/bridges', { params: filters }).then(unwrap<BridgeWithRate[]>);

export const getBridge = (id: string) => apiClient.get(`/bridges/${id}`).then(unwrap<BridgeWithRate>);

export const searchBridges = (q: string) => apiClient.get('/bridges/search', { params: { q } }).then(unwrap<BridgeWithRate[]>);

export const calculateToll = (bridgeId: string, category: VehicleCategory) => {
  return apiClient.get('/toll/calculate', { params: { bridgeId, category } }).then(unwrap<{ amount: number; amountTaka: number }>);
};
