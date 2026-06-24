import { User } from './auth.types';

export interface DashboardStats {
  todayRevenuePaisa: number;
  todayTransactionCount: number;
  totalActiveUsers: number;
  pendingVehicleCount: number;
  weeklyRevenue: Array<{ date: string; amountPaisa: number }>;
  paymentMethodBreakdown: Record<string, number>;
}

export interface AdminUser extends User {
  _count?: { vehicles: number; transactions: number };
  wallet?: { balance: number } | null;
}
