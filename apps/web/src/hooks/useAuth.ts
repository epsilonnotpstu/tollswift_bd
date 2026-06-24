import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 60_000
  });

  const sendOTPMutation = useMutation({ mutationFn: authApi.sendOTP });

  const verifyOTPMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authApi.verifyOTP(email, code),
    onSuccess: (data) => setAuth(data.user, data.accessToken, data.refreshToken)
  });

  const loginMutation = useMutation({
    mutationFn: authApi.loginEmail,
    onSuccess: (data) => setAuth(data.user, data.accessToken, data.refreshToken)
  });

  const googleMutation = useMutation({
    mutationFn: authApi.googleAuth,
    onSuccess: (data) => setAuth(data.user, data.accessToken, data.refreshToken)
  });

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      queryClient.clear();
      setLoading(false);
    }
  };

  return {
    user: meQuery.data ?? user,
    isAuthenticated,
    isLoading:
      isLoading ||
      meQuery.isLoading ||
      sendOTPMutation.isPending ||
      verifyOTPMutation.isPending ||
      loginMutation.isPending ||
      googleMutation.isPending,
    sendOTP: sendOTPMutation.mutateAsync,
    verifyOTP: verifyOTPMutation.mutateAsync,
    loginEmail: loginMutation.mutateAsync,
    loginGoogle: googleMutation.mutateAsync,
    logout,
    refreshUser: meQuery.refetch
  };
};
