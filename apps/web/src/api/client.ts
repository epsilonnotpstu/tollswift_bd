import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
  error: { code: string; details?: unknown } | null;
}

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
            '/api/v1/auth/refresh',
            { refreshToken }
          );
          const tokens = response.data.data;
          useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return apiClient(original);
        } catch {
          useAuthStore.getState().clearAuth();
        }
      }
    }

    if (status === 401) {
      useAuthStore.getState().clearAuth();
    }

    const message = error.response?.data?.message ?? error.message ?? 'Request failed';
    return Promise.reject(new Error(message));
  }
);
