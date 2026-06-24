export type PaymentMethod = 'WALLET' | 'SSLCOMMERZ' | 'BKASH' | 'NAGAD' | 'CARD';
export type TransactionType = 'TOLL_PAYMENT' | 'WALLET_DEPOSIT' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  userId: string;
  vehicleId: string;
  vehiclePlate: string;
  bridgeId: string;
  bridgeName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  type: TransactionType;
  status: TransactionStatus;
  sslTransactionId?: string | null;
  sslSessionKey?: string | null;
  refundReason?: string | null;
  refundedAt?: string | null;
  receiptUrl?: string | null;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  reference?: string | null;
  createdAt: string;
}
