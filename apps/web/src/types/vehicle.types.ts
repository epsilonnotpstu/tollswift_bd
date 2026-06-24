export type VehicleType = 'MOTORBIKE' | 'CAR' | 'MICROBUS' | 'BUS' | 'TRUCK' | 'HEAVY_TRUCK';
export type VehicleCategory = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type VehicleStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export interface Vehicle {
  id: string;
  ownerId: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  vehicleCategory: VehicleCategory;
  ownerName: string;
  fuelType?: FuelType | null;
  brtaCertNumber?: string | null;
  frontPhotoUrl?: string | null;
  backPhotoUrl?: string | null;
  status: VehicleStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt: string;
  brtaVerified?: boolean | null;
  brtaVerifiedAt?: string | null;
  brtaData?: unknown;
  owner?: { id: string; fullName: string; email: string; phone?: string | null } | null;
}

export interface CreateVehicleRequest {
  registrationNumber: string;
  vehicleType: VehicleType;
  vehicleCategory: VehicleCategory;
  ownerName: string;
  fuelType?: FuelType;
  brtaCertNumber?: string;
}
