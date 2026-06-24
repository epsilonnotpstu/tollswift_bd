import { User } from './auth.types';

export interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingVehicles: number;
  activeBridges: number;
}

export interface AdminUser extends User {
  vehicleCount?: number;
  transactionCount?: number;
  walletBalance?: number;
}
