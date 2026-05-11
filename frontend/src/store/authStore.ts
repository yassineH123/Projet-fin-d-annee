import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  // Initialize store from AsyncStorage
  login: async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    set({ user: data.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    await AsyncStorage.setItem('token', res.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.user));

    set({ user: res.user, isAuthenticated: true });
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const stateUser = await AsyncStorage.getItem('user');
    const email = stateUser ? JSON.parse(stateUser).email : null;
    if (!email) throw new Error('Utilisateur non connecté');

    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
    return Promise.resolve();
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },
}));

// Load persisted auth state
(async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('token');
    if (userStr && token) {
      const user = JSON.parse(userStr);
      // Access the store setter by calling the hook
      const store = useAuthStore.getState();
      if (!store.isAuthenticated) {
        useAuthStore.setState({ user, isAuthenticated: true });
      }
    }
  } catch (e) {
    // ignore
  }
})();
