'use client';

import { useMemo, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, ListOrdered } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { PageHeader } from '@/components/dashboard/page-header';
import { MagicCard } from '@/components/ui/magic-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BackendWarmupCard } from '@/components/shared/backend-warmup-card';
import {
    useDashboardCategoryBreakdown,
    useDashboardComparison,
    useDashboardMonthlyTrends,
    useDashboardRecentActivity,
    useDashboardSummary,
} from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/authStore';

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
}

function formatMonthLabel(value: string) {
    const [year, month] = value.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('en-IN', { month: 'short' });
}

function formatPercent(value: number) {
    if (!Number.isFinite(value)) return '0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function DashboardPage() {
    const userRole = useAuthStore((state) => state.user?.role || 'viewer');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const range = useMemo(() => ({ startDate, endDate }), [startDate, endDate]);
    const canViewAnalytics = userRole === 'admin' || userRole === 'analyst';

    const { data: summary, isLoading: summaryLoading } = useDashboardSummary(range);
    const { data: monthlyTrends = [], isLoading: monthlyLoading } = useDashboardMonthlyTrends(canViewAnalytics);
    const { data: categoryBreakdown = [], isLoading: categoryLoading } = useDashboardCategoryBreakdown(range);
    const { data: recentActivity = [], isLoading: recentLoading } = useDashboardRecentActivity(5);
    const { data: comparison, isLoading: comparisonLoading } = useDashboardComparison(canViewAnalytics);

    const expenseBreakdown = categoryBreakdown.filter((item: { type: string; }) => item.type === 'expense');
    const pieColors = ['#EF4444', '#F97316', '#F59E0B', '#EC4899', '#A855F7', '#3B82F6', '#10B981', '#6B7280'];
    const showWarmupCard = summaryLoading && !summary;

    return (
        <div>
            <PageHeader title="Overview" subtitle="Real-time cashflow and balance health." />

            <BackendWarmupCard visible={showWarmupCard} className="mb-4" />

            <div className="mb-4 grid gap-3 rounded-xl border border-white/50 bg-white/70 p-3 md:grid-cols-3">
                <div>
                    <label className="text-xs font-medium uppercase text-slate-500">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs font-medium uppercase text-slate-500">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                        }}
                        className="w-full rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>

            {summaryLoading ? (
                <div className="mb-4 grid gap-4 md:grid-cols-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-4">
                <MagicCard>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">Net Balance</p>
                        <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{formatCurrency(summary?.net || 0)}</p>
                    <Badge className="mt-3 w-fit" variant="default">Live</Badge>
                </MagicCard>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">Income</p>
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{formatCurrency(summary?.income || 0)}</p>
                        <Badge className="mt-3 w-fit" variant="success">Healthy</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">Expenses</p>
                            <TrendingDown className="h-4 w-4 text-rose-600" />
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{formatCurrency(summary?.expense || 0)}</p>
                        <Badge className="mt-3 w-fit" variant="warning">Watch</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">Transactions</p>
                            <ListOrdered className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{summary?.count || 0}</p>
                        <Badge className="mt-3 w-fit" variant="default">Count</Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Monthly Trend (12 Months)</h3>
                            {canViewAnalytics && monthlyLoading ? <Skeleton className="h-4 w-16" /> : null}
                        </div>

                        {canViewAnalytics ? (
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tickFormatter={formatMonthLabel} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="income" fill="#16A34A" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#DC2626" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Analytics charts are available for Analyst and Admin roles.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Expense by Category</h3>
                            {categoryLoading ? <Skeleton className="h-4 w-16" /> : null}
                        </div>

                        {canViewAnalytics ? (
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={expenseBreakdown} dataKey="total" nameKey="name" innerRadius={56} outerRadius={96}>
                                            {expenseBreakdown.map((item: { category_id: string; }, index: number) => (
                                                <Cell key={item.category_id || index} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Analytics charts are available for Analyst and Admin roles.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">Recent Activity</h3>
                            {recentLoading ? <Skeleton className="h-4 w-16" /> : null}
                        </div>
                        <div className="space-y-2">
                            {recentActivity.map((row: { id: string; description?: string; date: string; type: 'income' | 'expense'; amount: number; }) => (
                                <div key={row.id} className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium">{row.description || 'No description'}</p>
                                        <p className="text-xs text-muted-foreground">{row.date}</p>
                                    </div>
                                    <span className={row.type === 'income' ? 'text-sm font-semibold text-emerald-600' : 'text-sm font-semibold text-rose-600'}>
                                        {row.type === 'income' ? '+' : '-'}{formatCurrency(row.amount)}
                                    </span>
                                </div>
                            ))}
                            {recentActivity.length === 0 ? <p className="text-sm text-muted-foreground">No recent transactions found.</p> : null}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">This Month vs Last Month</h3>
                            {canViewAnalytics && comparisonLoading ? <Skeleton className="h-4 w-16" /> : null}
                        </div>
                        {canViewAnalytics ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                                    <span>Income Change</span>
                                    <span className="font-semibold text-emerald-600">{formatPercent(comparison?.change?.incomePercent || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                                    <span>Expense Change</span>
                                    <span className="font-semibold text-rose-600">{formatPercent(comparison?.change?.expensePercent || 0)}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                                    <span>Net Change</span>
                                    <span className="font-semibold text-indigo-600">{formatPercent(comparison?.change?.netPercent || 0)}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">This comparison view is available for Analyst and Admin roles.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
