export const ACCESS_TOKEN_KEY = 'fd_access_token';
export const USER_KEY = 'fd_user';

export type DecodedToken = {
  sub: string;
  email?: string;
  role?: 'admin' | 'analyst' | 'viewer';
  exp?: number;
};

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  document.cookie = `fd_access_token=${token}; path=/; samesite=lax`;
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = 'fd_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  clearAccessToken();
  window.localStorage.removeItem(USER_KEY);
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as DecodedToken;
  } catch {
    return null;
  }
}
