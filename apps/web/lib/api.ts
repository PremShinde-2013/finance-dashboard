import axios from 'axios';
import { toast } from 'sonner';
import { clearAccessToken, getAccessToken } from '@/lib/auth';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error?.response?.status === 401) {
        clearAccessToken();
        window.localStorage.removeItem('fd_user');
        window.location.href = '/login';
      } else if (error?.response?.status === 403) {
        toast.error('Access denied');
      }
    }
    return Promise.reject(error);
  }
);
