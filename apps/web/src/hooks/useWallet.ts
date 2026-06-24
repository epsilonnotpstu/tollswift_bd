import { useQuery } from '@tanstack/react-query';
import * as walletApi from '@/api/wallet.api';
import { useAuthStore } from '@/store/authStore';

export const useWallet = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    enabled: isAuthenticated,
    refetchInterval: 30_000
  });

  return {
    balance: walletQuery.data?.balance ?? 0,
    balanceTaka: walletQuery.data?.balanceTaka ?? 0,
    transactions: walletQuery.data?.recentTransactions ?? [],
    isLoading: walletQuery.isLoading,
    refetch: walletQuery.refetch
  };
};
