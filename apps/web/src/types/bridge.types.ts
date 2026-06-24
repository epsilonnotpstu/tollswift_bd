export type BridgeCategory = 'EXPRESSWAY' | 'NATIONAL' | 'LOCAL';
export type BridgeStatus = 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';

export interface Bridge {
  id: string;
  name: string;
  nameBn: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  category: BridgeCategory;
  status: BridgeStatus;
  imageUrl?: string | null;
  authorityName: string;
  hasFastpass: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TollRate {
  id: string;
  bridgeId: string;
  rateA: number;
  rateB: number;
  rateC: number;
  rateD: number;
  rateE: number;
  rateF: number;
  effectiveFrom: string;
  updatedById: string;
  updatedAt: string;
}
