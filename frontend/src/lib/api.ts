import axios from 'axios';
import { getAuthScope, getStorageKeys } from './authScope';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach token based on role/portal scope
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      let scope = getAuthScope(window.location.pathname);
      if (config.url?.startsWith('/admin')) {
        scope = 'admin';
      } else if (config.url?.startsWith('/restaurant')) {
        scope = 'restaurant';
      } else if (config.url?.startsWith('/driver')) {
        scope = 'driver';
      }

      const keys = getStorageKeys(scope);
      const token =
        localStorage.getItem(keys.accessToken) ||
        (scope === 'customer' ? localStorage.getItem('access_token') : null);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401 & portal-aware redirection
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 when not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;

        // Skip refresh logic on authentication pages
        if (
          currentPath.includes('/login') ||
          currentPath.includes('/register') ||
          currentPath.includes('/forgot-password') ||
          currentPath.includes('/reset-password')
        ) {
          return Promise.reject(error);
        }

        // Skip refresh logic if the failed request was already the refresh endpoint itself
        if (originalRequest.url?.includes('/auth/refresh')) {
          return Promise.reject(error);
        }

        const scope = getAuthScope(currentPath);
        const keys = getStorageKeys(scope);
        const refreshToken =
          localStorage.getItem(keys.refreshToken) ||
          (scope === 'customer' ? localStorage.getItem('refresh_token') : null);

        if (!refreshToken) {
          handleAuthFailure(currentPath);
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const resp = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const data = resp.data?.data;
          if (data?.accessToken) {
            localStorage.setItem(keys.accessToken, data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem(keys.refreshToken, data.refreshToken);
            }
            if (data.user) {
              localStorage.setItem(keys.authUser, JSON.stringify(data.user));
            }
            if (scope === 'customer') {
              localStorage.setItem('access_token', data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
              }
              if (data.user) {
                localStorage.setItem('auth_user', JSON.stringify(data.user));
              }
            }

            api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

            processQueue(null, data.accessToken);
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          handleAuthFailure(currentPath);
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

function handleAuthFailure(currentPath: string) {
  if (typeof window === 'undefined') return;
  const scope = getAuthScope(currentPath);
  const keys = getStorageKeys(scope);

  localStorage.removeItem(keys.accessToken);
  localStorage.removeItem(keys.refreshToken);
  localStorage.removeItem(keys.authUser);
  localStorage.removeItem(keys.businessStatus);

  if (scope === 'customer') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('business_status');
  }

  const protectedPrefixes = [
    '/admin',
    '/restaurant',
    '/driver',
    '/delivery',
    '/deliveries',
    '/account',
    '/checkout',
    '/orders',
    '/profile',
  ];
  const isProtected = protectedPrefixes.some((prefix) => currentPath.startsWith(prefix));

  if (!isProtected) {
    return;
  }

  if (currentPath.startsWith('/admin')) {
    window.location.href = '/admin/login';
  } else if (currentPath.startsWith('/restaurant')) {
    window.location.href = '/restaurant/login';
  } else if (
    currentPath.startsWith('/driver') ||
    currentPath.startsWith('/delivery') ||
    currentPath.startsWith('/deliveries')
  ) {
    window.location.href = '/driver/login';
  } else {
    window.location.href = '/login';
  }
}

export default api;
