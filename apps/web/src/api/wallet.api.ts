import { apiClient, unwrap } from './client';
import { WalletTransaction } from '@/types/transaction.types';

export interface WalletResponse {
  balance: number;
  balanceTaka: number;
  recentTransactions: WalletTransaction[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DepositSession {
  gatewayUrl: string;
  sessionKey: string;
  transactionId: string;
  amount: number;
  amountTaka: number;
}

export const getWallet = () => apiClient.get('/wallet').then(unwrap<WalletResponse>);

export const getTransactions = (page = 1, limit = 20) => {
  return apiClient.get('/wallet/transactions', { params: { page, limit } }).then(unwrap<Paginated<WalletTransaction>>);
};

export const initDeposit = (amount: number, method: 'SSLCOMMERZ' | 'BKASH' | 'NAGAD' | 'CARD' = 'SSLCOMMERZ') => {
  return apiClient.post('/wallet/deposit/init', { amount, method }).then(unwrap<DepositSession>);
};
