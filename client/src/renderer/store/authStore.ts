import { create } from 'zustand';
import { api } from '../services/api';
import { secureStorage } from '../services/secureStorage';
import { isNative } from '../services/platform';
import { initPushNotifications } from '../services/pushNotifications';

interface User {
  id: string;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  status?: string;
  global_role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { username, password });
      await secureStorage.setTokens(res.data.access_token, res.data.refresh_token);
      set({ user: res.data.user, isAuthenticated: true });
      if (isNative) initPushNotifications();
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', data);
      await secureStorage.setTokens(res.data.access_token, res.data.refresh_token);
      set({ user: res.data.user, isAuthenticated: true });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Registration failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await secureStorage.clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const token = await secureStorage.getAccessToken();
      if (token) {
        // Ideally fetch @me here
        // For now we trust the token exists and try to fetch user info if we had an endpoint
        // set({ isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
