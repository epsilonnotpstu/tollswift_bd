export type Role = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'UNVERIFIED';

export interface User {
  id: string;
  email: string;
  phone?: string | null;
  fullName: string;
  photoUrl?: string | null;
  nidNumber?: string | null;
  role: Role;
  status: UserStatus;
  division?: string | null;
  district?: string | null;
  emergencyContact?: string | null;
  googleId?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
