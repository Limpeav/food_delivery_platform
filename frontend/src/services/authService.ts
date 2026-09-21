import api from '@/lib/api';
import {
  ApiResponse,
  AuthResponse,
  CustomerRegisterRequest,
  DriverOnboardingRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RestaurantOnboardingRequest,
  User,
} from '@/types';

export const authService = {
  // Generic login
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  // Portal-specific logins
  async customerLogin(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/customer/login', data);
    return res.data.data;
  },

  async restaurantLogin(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/restaurant/login', data);
    return res.data.data;
  },

  async driverLogin(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/driver/login', data);
    return res.data.data;
  },

  async adminLogin(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/admin/login', data);
    return res.data.data;
  },

  // Onboardings & Registrations
  async customerRegister(data: CustomerRegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/customer/register', data);
    return res.data.data;
  },

  async restaurantRegister(data: RestaurantOnboardingRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/restaurant/register', data);
    return res.data.data;
  },

  async driverRegister(data: DriverOnboardingRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/driver/register', data);
    return res.data.data;
  },

  // Password Recovery
  async forgotPassword(data: ForgotPasswordRequest): Promise<string | undefined> {
    const res = await api.post<ApiResponse<string>>('/auth/forgot-password', data);
    return res.data.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post<ApiResponse<void>>('/auth/reset-password', data);
  },

  // Token refresh
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    return res.data.data;
  },

  // Session user profile
  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  // Logout
  async logout(refreshToken?: string | null): Promise<void> {
    const token = refreshToken !== undefined
      ? refreshToken
      : (typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null);
    try {
      await api.post('/auth/logout', { refreshToken: token });
    } catch {
      // ignore network/backend errors on logout
    }
  },
};
