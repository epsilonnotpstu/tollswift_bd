import { apiClient, unwrap } from './client';
import { User } from '@/types/auth.types';

export interface UpdateMePayload {
  fullName?: string;
  phone?: string;
  division?: string;
  district?: string;
  emergencyContact?: string;
}

export const updateMe = (data: UpdateMePayload) =>
  apiClient.patch('/users/me', data).then(unwrap<User>);
