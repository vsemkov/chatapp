import { apiClient } from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  async register(login: string, password: string, avatar?: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', { login, password, avatar });
  },

  async login(login: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { login, password });
  },

  async logout(): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>('/auth/logout');
  },

  async me(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }
};
