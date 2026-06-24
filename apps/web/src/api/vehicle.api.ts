import { apiClient, unwrap } from './client';
import { CreateVehicleRequest, Vehicle } from '@/types/vehicle.types';

export interface VerifyVehicleRequest {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export const getMyVehicles = () => apiClient.get('/vehicles').then(unwrap<Vehicle[]>);

export const getVehicle = (id: string) => apiClient.get(`/vehicles/${id}`).then(unwrap<Vehicle>);

export const createVehicle = (data: CreateVehicleRequest, photos?: { frontPhoto?: File; backPhoto?: File }) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  if (photos?.frontPhoto) formData.append('frontPhoto', photos.frontPhoto);
  if (photos?.backPhoto) formData.append('backPhoto', photos.backPhoto);
  return apiClient.post('/vehicles', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(unwrap<Vehicle>);
};

export const updateVehicle = (id: string, data: Partial<CreateVehicleRequest>) => {
  return apiClient.patch(`/vehicles/${id}`, data).then(unwrap<Vehicle>);
};

export const deleteVehicle = (id: string) => {
  return apiClient.delete(`/vehicles/${id}`).then(unwrap<{ deleted: boolean }>);
};

export const getPendingVehicles = () => apiClient.get('/admin/vehicles/pending').then(unwrap<Vehicle[]>);

export const verifyVehicle = (id: string, data: VerifyVehicleRequest) => {
  return apiClient.patch(`/admin/vehicles/${id}/verify`, data).then(unwrap<Vehicle>);
};
