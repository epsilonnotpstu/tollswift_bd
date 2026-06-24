import { apiClient, unwrap } from './client';
import { PaymentMethod, Transaction } from '@/types/transaction.types';
import { Paginated } from './wallet.api';

export interface PayTollRequest {
  vehicleId: string;
  bridgeId: string;
  method: PaymentMethod;
}

export interface TollPaymentResponse {
  transactionId: string;
  amount: number;
  status: string;
  gatewayUrl?: string;
  sessionKey?: string;
}

export const payToll = (data: PayTollRequest) => apiClient.post('/toll/pay', data).then(unwrap<TollPaymentResponse>);

export const getTransactions = (page = 1, limit = 20, status?: string) => {
  return apiClient.get('/transactions', { params: { page, limit, status } }).then(unwrap<Paginated<Transaction>>);
};

export const getTransaction = (id: string) => apiClient.get(`/transactions/${id}`).then(unwrap<Transaction>);
