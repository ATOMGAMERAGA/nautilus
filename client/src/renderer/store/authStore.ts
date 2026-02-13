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
  clearError: () => void;
}

function getErrorMessage(err: any, fallback: string): string {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) return 'Connection timed out. Please try again.';
  if (err?.code === 'ERR_NETWORK' || !err?.response) return 'Cannot connect to server. Check your connection.';
  return fallback;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { username, password });
      await secureStorage.setTokens(res.data.access_token, res.data.refresh_token);
      set({ user: res.data.user, isAuthenticated: true });
      if (isNative) initPushNotifications();
    } catch (err: any) {
      set({ error: getErrorMessage(err, 'Login failed') });
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
      if (isNative) initPushNotifications();
    } catch (err: any) {
      set({ error: getErrorMessage(err, 'Registration failed') });
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
        try {
          const res = await api.get('/users/@me');
          set({ user: res.data, isAuthenticated: true });
        } catch {
          await secureStorage.clearTokens();
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
