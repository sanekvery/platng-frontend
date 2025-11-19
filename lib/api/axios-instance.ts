import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '@/lib/utils/tokenStore';

/**
 * Base configuration for all API instances
 */
const baseConfig = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Promise to track ongoing token refresh to prevent race conditions
 */
let refreshTokenPromise: Promise<string> | null = null;

/**
 * Auth API - For authentication endpoints (login, register, refresh)
 * Does not require auth token for most endpoints
 */
export const authAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API,
  ...baseConfig,
  withCredentials: true, // For refresh token cookies
});

/**
 * Event API - For event-related endpoints
 * Requires auth token for some endpoints
 */
export const eventAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_EVENT_API,
  ...baseConfig,
});

/**
 * Favorites API - For favorites-related endpoints
 * Always requires auth token
 */
export const favoritesAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FAVORITES_API,
  ...baseConfig,
});

/**
 * Notifications API - For notification endpoints
 * Requires auth token
 */
export const notificationsAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NOTIFICATIONS_API,
  ...baseConfig,
});

/**
 * Partner API - For partner endpoints
 * May require auth token depending on endpoint
 */
export const partnerAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PARTNER_API,
  ...baseConfig,
});

/**
 * Payments API - For payment and order endpoints
 * Requires auth token
 */
export const paymentsAPI: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PAYMENTS_API,
  ...baseConfig,
});

/**
 * Setup request interceptor to add auth token
 */
function setupAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get token from secure token store (memory-based)
      const token = tokenStore.getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
}

/**
 * Setup response interceptor for token refresh
 * Handles race conditions by queuing refresh requests
 */
function setupRefreshInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // If a refresh is already in progress, wait for it
          if (!refreshTokenPromise) {
            refreshTokenPromise = authAPI.post('/auth/refresh')
              .then(({ data }) => {
                const newToken = data.access_token;
                // Save new token to secure store
                tokenStore.setAccessToken(newToken);
                return newToken;
              })
              .catch((refreshError) => {
                // Refresh failed - clear auth and redirect to login
                tokenStore.clearTokens();

                // Only redirect if we're in the browser
                if (typeof window !== 'undefined') {
                  window.location.href = '/login';
                }
                throw refreshError;
              })
              .finally(() => {
                // Clear the promise so new requests can trigger a new refresh
                refreshTokenPromise = null;
              });
          }

          // Wait for the refresh to complete
          const newToken = await refreshTokenPromise;

          // Retry the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return axios.request(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
}

// Setup interceptors for APIs that need auth
setupAuthInterceptor(eventAPI);
setupAuthInterceptor(favoritesAPI);
setupAuthInterceptor(notificationsAPI);
setupAuthInterceptor(partnerAPI);
setupAuthInterceptor(paymentsAPI);

// Setup refresh interceptor for APIs that need auth
setupRefreshInterceptor(eventAPI);
setupRefreshInterceptor(favoritesAPI);
setupRefreshInterceptor(notificationsAPI);
setupRefreshInterceptor(partnerAPI);
setupRefreshInterceptor(paymentsAPI);

/**
 * Error logger for development
 */
if (process.env.NODE_ENV === 'development') {
  const errorLogger = (error: AxiosError) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      console.error('API No Response:', error.message);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  };

  authAPI.interceptors.response.use(undefined, errorLogger);
  eventAPI.interceptors.response.use(undefined, errorLogger);
  favoritesAPI.interceptors.response.use(undefined, errorLogger);
  notificationsAPI.interceptors.response.use(undefined, errorLogger);
  partnerAPI.interceptors.response.use(undefined, errorLogger);
  paymentsAPI.interceptors.response.use(undefined, errorLogger);
}
