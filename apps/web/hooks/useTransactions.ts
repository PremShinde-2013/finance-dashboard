'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type TransactionFilters = {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense' | '';
  category_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: string;
  max_amount?: string;
  search?: string;
  include_deleted?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
};

function normalizeParams(filters: TransactionFilters) {
  const params: Record<string, string | number | boolean> = {
    page: filters.page || 1,
    limit: filters.limit || 10,
    sort_by: filters.sort_by || 'date',
    sort_order: filters.sort_order || 'desc',
  };

  if (filters.type) params.type = filters.type;
  if (filters.category_id) params.category_id = filters.category_id;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.min_amount) params.min_amount = filters.min_amount;
  if (filters.max_amount) params.max_amount = filters.max_amount;
  if (filters.search) params.search = filters.search;
  if (filters.include_deleted) params.include_deleted = true;

  return params;
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data } = await api.get('/transactions', {
        params: normalizeParams(filters),
      });

      return {
        rows: data?.data || [],
        meta: data?.meta,
      };
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/transactions', payload);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await api.put(`/transactions/${id}`, payload);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSoftDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/transactions/${id}`);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useHardDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/transactions/${id}/hard`);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRestoreTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/transactions/${id}/restore`);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
