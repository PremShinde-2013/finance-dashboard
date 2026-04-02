import { create } from 'zustand';
import { clearAccessToken, setAccessToken, USER_KEY } from '@/lib/auth';

export type AuthRole = 'admin' | 'analyst' | 'viewer';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  hydrate: () => void;
  hasRole: (roles: AuthRole[]) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  login: (token, user) => {
    setAccessToken(token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    clearAccessToken();
    window.localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
  setUser: (user) => {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  setAuth: (token, user) => {
    setAccessToken(token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    clearAccessToken();
    window.localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem('fd_access_token');
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (!storedToken || !storedUser) {
      set({ hydrated: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser) as AuthUser;
      set({ token: storedToken, user, isAuthenticated: true, hydrated: true });
    } catch {
      clearAccessToken();
      window.localStorage.removeItem(USER_KEY);
      set({ user: null, token: null, isAuthenticated: false, hydrated: true });
    }
  },
  hasRole: (roles) => {
    const current = get().user?.role;
    if (!current) return false;
    return roles.includes(current);
  },
}));
