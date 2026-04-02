'use client';

import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', payload);
      return data?.data;
    },
    onSuccess: (result) => {
      const token = result?.token;
      const user = result?.user;
      if (token && user) {
        setAuth(token, user);
      }
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const { data } = await api.post('/auth/register', payload);
      return data?.data;
    },
    onSuccess: (result) => {
      const token = result?.token;
      const user = result?.user;
      if (token && user) {
        setAuth(token, user);
      }
    },
  });
}

export function useMe(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const query = useQuery({
    queryKey: ['me'],
    enabled,
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      const me = data?.data;
      if (me) setUser(me);
      return me;
    },
    retry: false,
  });

  useEffect(() => {
    if (query.isError) {
      clearAuth();
    }
  }, [clearAuth, query.isError]);

  return query;
}
