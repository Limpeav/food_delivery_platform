import { create } from 'zustand';
import { authService } from '@/services/authService';
import {
  AuthResponse,
  CustomerRegisterRequest,
  DriverOnboardingRequest,
  RestaurantOnboardingRequest,
  User,
} from '@/types';
import { getAuthScope, getStorageKeys, getExpectedRole, AuthScope } from '@/lib/authScope';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  businessStatus: string | null;
  statusMessage: string | null;

  initAuth: () => Promise<void>;
  customerLogin: (email: string, pass: string) => Promise<AuthResponse>;
  restaurantLogin: (email: string, pass: string) => Promise<AuthResponse>;
  driverLogin: (email: string, pass: string) => Promise<AuthResponse>;
  adminLogin: (email: string, pass: string) => Promise<AuthResponse>;
  login: (email: string, pass: string) => Promise<User>; // generic backwards compat

  customerRegister: (data: CustomerRegisterRequest) => Promise<AuthResponse>;
  restaurantRegister: (data: RestaurantOnboardingRequest) => Promise<AuthResponse>;
  driverRegister: (data: DriverOnboardingRequest) => Promise<AuthResponse>;
  register: (data: any) => Promise<User>; // backwards compat

  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setBusinessStatus: (status: string | null, message?: string | null) => void;
}

let isInitializingAuth = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  businessStatus: null,
  statusMessage: null,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    if (isInitializingAuth) return;
    isInitializingAuth = true;

    try {
      const scope = getAuthScope(window.location.pathname);
      const keys = getStorageKeys(scope);
      const expectedRole = getExpectedRole(scope);

      let token = localStorage.getItem(keys.accessToken);
      let refreshToken = localStorage.getItem(keys.refreshToken);
      let cachedUserStr = localStorage.getItem(keys.authUser);
      let cachedStatus = localStorage.getItem(keys.businessStatus);

      // Backwards-compatibility fallback: if scoped key not found yet, check legacy key
      if (!token && !cachedUserStr) {
        const legacyUserStr = localStorage.getItem('auth_user');
        if (legacyUserStr) {
          try {
            const legacyUser = JSON.parse(legacyUserStr);
            if (legacyUser.role === expectedRole) {
              token = localStorage.getItem('access_token');
              refreshToken = localStorage.getItem('refresh_token');
              cachedUserStr = legacyUserStr;
              cachedStatus = localStorage.getItem('business_status');

              // Migrate to scoped keys
              if (token) localStorage.setItem(keys.accessToken, token);
              if (refreshToken) localStorage.setItem(keys.refreshToken, refreshToken);
              localStorage.setItem(keys.authUser, legacyUserStr);
              if (cachedStatus) localStorage.setItem(keys.businessStatus, cachedStatus);
            }
          } catch {
            // ignore
          }
        }
      }

      let parsedUser: User | null = null;
      if (cachedUserStr) {
        try {
          const parsed = JSON.parse(cachedUserStr);
          if (parsed.role === expectedRole) {
            parsedUser = parsed;
            set({
              user: parsed,
              token,
              isAuthenticated: true,
              businessStatus: cachedStatus || null,
              isLoading: false,
              isInitialized: true,
            });
          }
        } catch {
          // ignore parsing error
        }
      }

      if (!parsedUser) {
        if (token || refreshToken) {
          set({ token, isAuthenticated: true, isLoading: true });
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          return;
        }
      }

      // Verify session in background against backend source of truth
      try {
        const freshUser = await authService.getMe();
        if (freshUser.role === expectedRole) {
          localStorage.setItem(keys.authUser, JSON.stringify(freshUser));
          set({
            user: freshUser,
            token: localStorage.getItem(keys.accessToken) || token,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch (err: any) {
        // If 401 Unauthorized, try refreshing using the refresh token
        if (err?.response?.status === 401) {
          if (refreshToken) {
            try {
              const refreshResp = await authService.refresh(refreshToken);
              handleAuthSuccess(refreshResp, set, scope);
              return;
            } catch {
              // Refresh token has also expired or been revoked
            }
          }
          // Both access token and refresh token are invalid
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
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        } else {
          // Server temporarily offline or non-401 error:
          // KEEP the cached session intact so the user is never kicked out!
          set({ isLoading: false, isInitialized: true });
        }
      }
    } finally {
      isInitializingAuth = false;
    }
  },

  customerLogin: async (email, password) => {
    set({ isLoading: true });
    try {
      const resp = await authService.customerLogin({ email, password });
      handleAuthSuccess(resp, set, 'customer');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  restaurantLogin: async (email, password) => {
    set({ isLoading: true });
    try {
      const resp = await authService.restaurantLogin({ email, password });
      handleAuthSuccess(resp, set, 'restaurant');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  driverLogin: async (email, password) => {
    set({ isLoading: true });
    try {
      const resp = await authService.driverLogin({ email, password });
      handleAuthSuccess(resp, set, 'driver');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  adminLogin: async (email, password) => {
    set({ isLoading: true });
    try {
      const resp = await authService.adminLogin({ email, password });
      handleAuthSuccess(resp, set, 'admin');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const resp = await authService.login({ email, password });
      handleAuthSuccess(resp, set, 'customer');
      return resp.user;
    } finally {
      set({ isLoading: false });
    }
  },

  customerRegister: async (data) => {
    set({ isLoading: true });
    try {
      const resp = await authService.customerRegister(data);
      handleAuthSuccess(resp, set, 'customer');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  restaurantRegister: async (data) => {
    set({ isLoading: true });
    try {
      const resp = await authService.restaurantRegister(data);
      handleAuthSuccess(resp, set, 'restaurant');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  driverRegister: async (data) => {
    set({ isLoading: true });
    try {
      const resp = await authService.driverRegister(data);
      handleAuthSuccess(resp, set, 'driver');
      return resp;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const resp = await authService.customerRegister(data);
      handleAuthSuccess(resp, set, 'customer');
      return resp.user;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const scope =
      typeof window !== 'undefined' ? getAuthScope(window.location.pathname) : 'customer';
    const keys = getStorageKeys(scope);
    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem(keys.refreshToken) || localStorage.getItem('refresh_token')
        : null;

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
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
      }
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
        businessStatus: null,
        statusMessage: null,
      });
    }
  },

  setUser: (user) => set({ user }),
  setBusinessStatus: (status, message = null) =>
    set({ businessStatus: status, statusMessage: message }),
}));

function handleAuthSuccess(resp: AuthResponse, set: any, explicitScope?: AuthScope) {
  const scope =
    explicitScope ||
    (typeof window !== 'undefined' ? getAuthScope(window.location.pathname) : 'customer');
  const keys = getStorageKeys(scope);

  if (typeof window !== 'undefined') {
    localStorage.setItem(keys.accessToken, resp.accessToken);
    localStorage.setItem(keys.refreshToken, resp.refreshToken);
    localStorage.setItem(keys.authUser, JSON.stringify(resp.user));
    if (resp.businessStatus) {
      localStorage.setItem(keys.businessStatus, resp.businessStatus);
    } else {
      localStorage.removeItem(keys.businessStatus);
    }

    if (scope === 'customer') {
      localStorage.setItem('access_token', resp.accessToken);
      localStorage.setItem('refresh_token', resp.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(resp.user));
      if (resp.businessStatus) {
        localStorage.setItem('business_status', resp.businessStatus);
      } else {
        localStorage.removeItem('business_status');
      }
    }
  }

  set({
    user: resp.user,
    token: resp.accessToken,
    isAuthenticated: true,
    isInitialized: true,
    businessStatus: resp.businessStatus || null,
    statusMessage: resp.statusMessage || null,
    isLoading: false,
  });
}
