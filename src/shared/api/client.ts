import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';
import { refreshTokens } from '@/features/auth/api/authApi';
import { ApiError, ApiValidationError, resolveErrorCode } from './errors';
import type { ApiResponse, ValidationErrorResponse } from './types';

type RetriableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

export const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!isAxiosError(error) || error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { accessToken, refreshToken, setSession, clearSession } = useAuthStore.getState();
    if (!accessToken || !refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= refreshTokens({ accessToken, refreshToken })
      .then((next) => {
        setSession(next);
        return next.accessToken;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const nextToken = await refreshPromise;
    if (!nextToken) return Promise.reject(error);

    originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${nextToken}` };
    return axiosInstance.request(originalRequest);
  },
);

export async function apiClient<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>(config);
    const body = response.data;

    if (body?.isSuccess && body.data !== undefined) {
      return body.data;
    }

    throw new ApiError(resolveErrorCode(response.status, body?.errorCode), response.status);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as (ApiResponse<unknown> & ValidationErrorResponse) | undefined;

      if (!error.response) throw new ApiError('NETWORK', 0, error.message);
      if (body?.errors) throw new ApiValidationError(body.errors);

      throw new ApiError(resolveErrorCode(status, body?.errorCode), status, error.message);
    }

    throw new ApiError('NETWORK', 0);
  }
}

export async function apiClientNoContent(config: AxiosRequestConfig): Promise<void> {
  try {
    await axiosInstance.request(config);
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as ApiResponse<unknown> | undefined;
      if (!error.response) throw new ApiError('NETWORK', 0, error.message);
      throw new ApiError(resolveErrorCode(status, body?.errorCode), status, error.message);
    }
    throw new ApiError('NETWORK', 0);
  }
}
