import axios, { isAxiosError, type AxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';
import { refreshTokens } from '@/features/auth/api/authApi';
import { useToastStore } from '@/shared/stores/toastStore';
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

function maybeToast(err: ApiError) {
  if (err.tier === 'toast') {
    useToastStore.getState().add({ message: err.message, variant: 'error' });
  }
}

export async function apiClient<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>(config);
    const body = response.data;

    if (body?.isSuccess && body.data !== undefined) {
      return body.data;
    }

    const err = new ApiError(resolveErrorCode(response.status, body?.errorCode), response.status);
    maybeToast(err);
    throw err;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as (ApiResponse<unknown> & ValidationErrorResponse) | undefined;

      if (!error.response) {
        const err = new ApiError('NETWORK', 0, error.message);
        maybeToast(err);
        throw err;
      }
      if (body?.errors) {
        const err = new ApiValidationError(body.errors);
        maybeToast(err);
        throw err;
      }

      // Let ApiError fall back to the human-readable message from errorMap; the
      // raw axios message (e.g. "Request failed with status code 401") is noise.
      const err = new ApiError(resolveErrorCode(status, body?.errorCode), status);
      maybeToast(err);
      throw err;
    }

    const err = new ApiError('NETWORK', 0);
    maybeToast(err);
    throw err;
  }
}

export async function apiClientNoContent(config: AxiosRequestConfig): Promise<void> {
  try {
    await axiosInstance.request(config);
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as ApiResponse<unknown> | undefined;
      if (!error.response) {
        const err = new ApiError('NETWORK', 0, error.message);
        maybeToast(err);
        throw err;
      }
      const err = new ApiError(resolveErrorCode(status, body?.errorCode), status);
      maybeToast(err);
      throw err;
    }
    const err = new ApiError('NETWORK', 0);
    maybeToast(err);
    throw err;
  }
}
