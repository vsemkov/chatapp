import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api';
import { apiClient } from '../api/client';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  async function setAuthData(userData: User, authToken: string) {
    user.value = userData;
    token.value = authToken;
    apiClient.setToken(authToken);
    await cookieStore.set('auth_token', authToken)
    await cookieStore.set('user', JSON.stringify(userData));
  }

  async function clearAuth() {
    user.value = null;
    token.value = null;
    apiClient.clearToken();
    await cookieStore.delete('auth_token');
    await cookieStore.delete('user');
  }

  async function login(login: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.login(login, password);
      await setAuthData(response.user, response.token);

      return response;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(login: string, password: string, avatar?: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await authApi.register(login, password, avatar);
      await setAuthData(response.user, response.token);

      return response;
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
      await clearAuth();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  async function restoreSession() {
    const storedToken = await cookieStore.get('auth_token');
    const storedUser = await cookieStore.get('user');

    if (storedToken?.value && storedUser?.value && storedToken?.value !== null && storedUser?.value !== null) {
      try {
        const userData = JSON.parse(storedUser.value);
        await setAuthData(userData, storedToken.value);

        return true;
      } catch (err) {
        await clearAuth();

        return false;
      }
    }
    return false;
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    restoreSession,
    clearAuth
  };
});
