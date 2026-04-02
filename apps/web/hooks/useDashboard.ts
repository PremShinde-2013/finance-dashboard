'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type DashboardRange = {
  startDate?: string;
  endDate?: string;
};

function buildRangeParams(range?: DashboardRange) {
  const params: Record<string, string> = {};

  if (range?.startDate) {
    params.start_date = range.startDate;
  }

  if (range?.endDate) {
    params.end_date = range.endDate;
  }

  return params;
}

export function useDashboardSummary(range?: DashboardRange) {
  return useQuery({
    queryKey: ['dashboard', 'summary', range?.startDate || '', range?.endDate || ''],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary', {
        params: buildRangeParams(range),
      });
      return data?.data;
    },
    refetchInterval: 60000,
  });
}

export function useDashboardMonthlyTrends(enabled = true) {
  const role = useAuthStore((state) => state.user?.role || 'viewer');
  const canViewAnalytics = role === 'admin' || role === 'analyst';

  return useQuery({
    queryKey: ['dashboard', 'monthly-trends'],
    enabled: enabled && canViewAnalytics,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/monthly-trends');
      return data?.data || [];
    },
    refetchInterval: 60000,
    retry: false,
  });
}

export function useDashboardCategoryBreakdown(range?: DashboardRange) {
  return useQuery({
    queryKey: ['dashboard', 'category-breakdown', range?.startDate || '', range?.endDate || ''],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/category-breakdown', {
        params: buildRangeParams(range),
      });
      return data?.data || [];
    },
    refetchInterval: 60000,
  });
}

export function useDashboardRecentActivity(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/recent-activity', {
        params: { limit },
      });
      return data?.data || [];
    },
    refetchInterval: 60000,
  });
}

export function useDashboardComparison(enabled = true) {
  const role = useAuthStore((state) => state.user?.role || 'viewer');
  const canViewAnalytics = role === 'admin' || role === 'analyst';

  return useQuery({
    queryKey: ['dashboard', 'comparison'],
    enabled: enabled && canViewAnalytics,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/comparison');
      return data?.data;
    },
    refetchInterval: 60000,
    retry: false,
  });
}
