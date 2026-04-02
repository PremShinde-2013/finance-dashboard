'use client';

import { useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Circle, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/page-header';
import {
    useCreateTransaction,
    useHardDeleteTransaction,
    useRestoreTransaction,
    useSoftDeleteTransaction,
    useTransactions,
    useUpdateTransaction,
} from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type TxFormState = {
    id?: string;
    amount: string;
    type: 'income' | 'expense';
    date: string;
    description: string;
    notes: string;
    category_id: string;
};

type CategoryMeta = {
    id: string;
    name: string;
    color?: string;
    icon?: string;
};

const defaultForm: TxFormState = {
    amount: '',
    type: 'expense',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    notes: '',
    category_id: '',
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);
}

function getCategoryIcon(iconName?: string): LucideIcon {
    if (!iconName) return Circle;
    const normalized = iconName.replace(/\s+/g, '');
    return (LucideIcons as unknown as Record<string, LucideIcon>)[normalized] || Circle;
}

export default function TransactionsPage() {
    const role = useAuthStore((state) => state.user?.role || 'viewer');
    const canMutate = role === 'admin' || role === 'analyst';
    const isAdmin = role === 'admin';

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [type, setType] = useState<'' | 'income' | 'expense'>('');
    const [categoryId, setCategoryId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [search, setSearch] = useState('');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<TxFormState>(defaultForm);

    const filters = useMemo(
        () => ({
            page,
            limit,
            type,
            category_id: categoryId,
            start_date: startDate,
            end_date: endDate,
            min_amount: minAmount,
            max_amount: maxAmount,
            search,
            include_deleted: includeDeleted && isAdmin,
        }),
        [page, limit, type, categoryId, startDate, endDate, minAmount, maxAmount, search, includeDeleted, isAdmin]
    );

    const { data: txData, isLoading } = useTransactions(filters);
    const { data: categories = [] } = useCategories();
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const softDeleteMutation = useSoftDeleteTransaction();
    const hardDeleteMutation = useHardDeleteTransaction();
    const restoreMutation = useRestoreTransaction();

    const rows = txData?.rows || [];
    const meta = txData?.meta;
    const categoryById = useMemo<Map<string, CategoryMeta>>(() => {
        return new Map<string, CategoryMeta>(categories.map((item: CategoryMeta) => [item.id, item]));
    }, [categories]);

    const openCreate = () => {
        setForm(defaultForm);
        setIsOpen(true);
    };

    const openEdit = (row: Record<string, unknown>) => {
        setForm({
            id: String(row.id || ''),
            amount: String(row.amount || ''),
            type: (row.type as 'income' | 'expense') || 'expense',
            date: String(row.date || new Date().toISOString().slice(0, 10)),
            description: String(row.description || ''),
            notes: String(row.notes || ''),
            category_id: String(row.category_id || ''),
        });
        setIsOpen(true);
    };

    const submitForm = async () => {
        if (!form.amount || Number(form.amount) <= 0) {
            toast.error('Amount must be greater than 0');
            return;
        }

        const payload = {
            amount: Number(form.amount),
            type: form.type,
            date: form.date,
            description: form.description || null,
            notes: form.notes || null,
            category_id: form.category_id || null,
        };

        try {
            if (form.id) {
                await updateMutation.mutateAsync({ id: form.id, payload });
                toast.success('Transaction updated');
            } else {
                await createMutation.mutateAsync(payload);
                toast.success('Transaction created');
            }
            setIsOpen(false);
            setForm(defaultForm);
        } catch {
            toast.error('Failed to save transaction');
        }
    };

    const handleSoftDelete = async (id: string) => {
        if (!confirm('Soft delete this transaction?')) return;
        try {
            await softDeleteMutation.mutateAsync(id);
            toast.success('Transaction moved to deleted state');
        } catch {
            toast.error('Failed to delete transaction');
        }
    };

    const handleHardDelete = async (id: string) => {
        if (!confirm('Permanently delete this transaction? This cannot be undone.')) return;
        try {
            await hardDeleteMutation.mutateAsync(id);
            toast.success('Transaction permanently deleted');
        } catch {
            toast.error('Failed to hard delete transaction');
        }
    };

    const handleRestore = async (id: string) => {
        try {
            await restoreMutation.mutateAsync(id);
            toast.success('Transaction restored');
        } catch {
            toast.error('Failed to restore transaction');
        }
    };

    return (
        <div>
            <PageHeader title="Transactions" subtitle="Manage inflow and outflow records." />

            <div className="mb-4 grid gap-3 rounded-xl border bg-white/70 p-3 md:grid-cols-4">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description/notes" className="rounded-md border px-3 py-2 text-sm" />
                <select value={type} onChange={(e) => setType(e.target.value as '' | 'income' | 'expense')} className="rounded-md border px-3 py-2 text-sm">
                    <option value="">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                    <option value="">All categories</option>
                    {categories.map((item: { id: string; name: string; }) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                </select>
                <select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))} className="rounded-md border px-3 py-2 text-sm">
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                </select>

                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-md border px-3 py-2 text-sm" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-md border px-3 py-2 text-sm" />
                <input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="Min amount" className="rounded-md border px-3 py-2 text-sm" />
                <input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="Max amount" className="rounded-md border px-3 py-2 text-sm" />

                {isAdmin ? (
                    <label className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                        <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />
                        Include deleted transactions
                    </label>
                ) : null}

                <div className="col-span-2 flex gap-2 md:justify-end">
                    <button
                        onClick={() => {
                            setPage(1);
                            setType('');
                            setCategoryId('');
                            setStartDate('');
                            setEndDate('');
                            setMinAmount('');
                            setMaxAmount('');
                            setSearch('');
                            setIncludeDeleted(false);
                        }}
                        className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        Reset
                    </button>
                    {canMutate ? (
                        <button onClick={openCreate} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                            Create Transaction
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white/70">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100/80 text-left">
                        <tr>
                            <th className="px-3 py-2">Date</th>
                            <th className="px-3 py-2">Description</th>
                            <th className="px-3 py-2">Category</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2 text-right">Amount</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <tr key={`skeleton-${index}`} className="border-t">
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-24" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-40" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-28" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-5 w-16" /></td>
                                    <td className="px-3 py-2 text-right"><Skeleton className="ml-auto h-4 w-24" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-7 w-32" /></td>
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>No transactions found.</td>
                            </tr>
                        ) : (
                            rows.map((row: Record<string, unknown>) => (
                                <tr key={String(row.id)} className="border-t">
                                    <td className="px-3 py-2">{String(row.date || '-')}</td>
                                    <td className="px-3 py-2">{String(row.description || '-')}</td>
                                    <td className="px-3 py-2">
                                        {(() => {
                                            const category = ((row.categories as CategoryMeta | undefined)
                                                || categoryById.get(String(row.category_id || ''))) as CategoryMeta | undefined;
                                            const CategoryIcon = getCategoryIcon(category?.icon);
                                            const color = category?.color || '#94A3B8';

                                            if (!category?.name) {
                                                return <span className="text-muted-foreground">-</span>;
                                            }

                                            return (
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                                                        <CategoryIcon className="h-4 w-4" style={{ color }} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="truncate font-medium text-slate-900">{category.name}</span>
                                                            <span className="h-2.5 w-2.5 rounded-full border border-slate-300" style={{ backgroundColor: color }} />
                                                        </div>
                                                        <p className="font-mono text-[11px] text-slate-500">{color.toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.type === 'income' ? 'success' : 'danger'}>{String(row.type || '')}</Badge>
                                    </td>
                                    <td className={row.type === 'income' ? 'px-3 py-2 text-right font-semibold text-emerald-600' : 'px-3 py-2 text-right font-semibold text-rose-600'}>
                                        {formatCurrency(Number(row.amount || 0))}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            {canMutate && !row.is_deleted ? (
                                                <>
                                                    <button className="rounded border px-2 py-1 text-xs" onClick={() => openEdit(row)}>Edit</button>
                                                    <button className="rounded border border-amber-300 px-2 py-1 text-xs text-amber-700" onClick={() => handleSoftDelete(String(row.id))}>Soft Delete</button>
                                                </>
                                            ) : null}

                                            {isAdmin && row.is_deleted ? (
                                                <button className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700" onClick={() => handleRestore(String(row.id))}>Restore</button>
                                            ) : null}

                                            {isAdmin ? (
                                                <button className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700" onClick={() => handleHardDelete(String(row.id))}>Hard Delete</button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Page {meta?.page || page} of {meta?.totalPages || 1} • Total {meta?.total || rows.length}</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={(meta?.page || page) <= 1}
                        className="rounded border px-3 py-1 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={Boolean(meta && (meta.page >= meta.totalPages))}
                        className="rounded border px-3 py-1 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
                        <h3 className="mb-3 text-lg font-semibold">{form.id ? 'Edit Transaction' : 'Create Transaction'}</h3>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-xs font-medium text-slate-500">Amount</label>
                                <input value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Type</label>
                                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as 'income' | 'expense' }))} className="mt-1 w-full rounded border px-3 py-2 text-sm">
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Date</label>
                                <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Category</label>
                                <select value={form.category_id} onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm">
                                    <option value="">No category</option>
                                    {categories
                                        .filter((item: { type: string; }) => item.type === form.type)
                                        .map((item: { id: string; name: string; }) => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Description</label>
                                <input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" rows={3} />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setIsOpen(false)} className="rounded border px-3 py-2 text-sm">Cancel</button>
                            <button
                                onClick={submitForm}
                                className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {form.id ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
