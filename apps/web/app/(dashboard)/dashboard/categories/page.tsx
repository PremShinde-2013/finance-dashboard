'use client';

import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Circle, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/page-header';
import { useCreateCategory, useCategories, useDeleteCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type CategoryForm = {
    id?: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    icon: string;
    is_default: boolean;
};

const initialForm: CategoryForm = {
    name: '',
    type: 'expense',
    color: '#EF4444',
    icon: '',
    is_default: false,
};

type CategoryRow = {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color?: string;
    icon?: string;
    is_default: boolean;
};

function getIconComponent(iconName?: string): LucideIcon {
    if (!iconName) return Circle;
    const normalized = iconName.replace(/\s+/g, '');
    return (LucideIcons as unknown as Record<string, LucideIcon>)[normalized] || Circle;
}

export default function CategoriesPage() {
    const role = useAuthStore((state) => state.user?.role || 'viewer');
    const isAdmin = role === 'admin';

    const { data: categories = [], isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<CategoryForm>(initialForm);

    const openCreate = () => {
        setForm(initialForm);
        setIsOpen(true);
    };

    const openEdit = (row: CategoryRow) => {
        setForm({
            id: row.id,
            name: row.name,
            type: row.type,
            color: row.color || '#64748B',
            icon: row.icon || '',
            is_default: Boolean(row.is_default),
        });
        setIsOpen(true);
    };

    const submit = async () => {
        if (!form.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        const payload = {
            name: form.name.trim(),
            type: form.type,
            color: form.color,
            icon: form.icon || null,
            is_default: form.is_default,
        };

        try {
            if (form.id) {
                await updateMutation.mutateAsync({ id: form.id, payload });
                toast.success('Category updated');
            } else {
                await createMutation.mutateAsync(payload);
                toast.success('Category created');
            }
            setIsOpen(false);
            setForm(initialForm);
        } catch {
            toast.error('Failed to save category');
        }
    };

    const remove = async (row: { id: string; is_default: boolean }) => {
        if (row.is_default) {
            toast.error('Default categories cannot be deleted');
            return;
        }
        if (!confirm('Delete this category?')) return;

        try {
            await deleteMutation.mutateAsync(row.id);
            toast.success('Category deleted');
        } catch {
            toast.error('Failed to delete category');
        }
    };

    return (
        <div>
            <PageHeader title="Categories" subtitle="Control how transactions are grouped." />
            <p className="mb-4 text-sm text-slate-600">
                Color and icon are used as visual tags across category lists and charts for faster recognition.
            </p>

            <div className="mb-4 flex justify-end">
                {isAdmin ? (
                    <button onClick={openCreate} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                        Create Category
                    </button>
                ) : null}
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white/70">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100/80 text-left">
                        <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Type</th>
                            <th className="px-3 py-2">Color</th>
                            <th className="px-3 py-2">Icon</th>
                            <th className="px-3 py-2">Default</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <tr key={`cat-skeleton-${index}`} className="border-t">
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-32" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-5 w-20" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-24" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-24" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-12" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-7 w-24" /></td>
                                </tr>
                            ))
                        ) : categories.length === 0 ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>No categories found.</td>
                            </tr>
                        ) : (
                            categories.map((row: CategoryRow) => (
                                <tr key={row.id} className="border-t">
                                    <td className="px-3 py-2">{row.name}</td>
                                    <td className="px-3 py-2">
                                        <Badge variant={row.type === 'income' ? 'success' : 'danger'}>{row.type}</Badge>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-5 w-5 rounded-full border border-slate-300" style={{ backgroundColor: row.color || '#94A3B8' }} />
                                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs text-slate-700">
                                                {(row.color || '#94A3B8').toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const IconComponent = getIconComponent(row.icon);
                                                return <IconComponent className="h-4 w-4 text-slate-700" />;
                                            })()}
                                            <span className="text-slate-700">{row.icon || 'Circle'}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {row.is_default ? <Badge variant="default">Yes</Badge> : <Badge variant="warning">No</Badge>}
                                    </td>
                                    <td className="px-3 py-2">
                                        {isAdmin ? (
                                            <div className="flex gap-2">
                                                <button className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50" onClick={() => openEdit(row)}>Edit</button>
                                                <button
                                                    className="rounded border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                                                    onClick={() => remove({ id: row.id, is_default: row.is_default })}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">View only</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
                        <h3 className="mb-3 text-lg font-semibold">{form.id ? 'Edit Category' : 'Create Category'}</h3>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Name</label>
                                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Type</label>
                                <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as 'income' | 'expense' }))} className="mt-1 w-full rounded border px-3 py-2 text-sm">
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Color</label>
                                <input type="color" value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} className="mt-1 h-10 w-full rounded border px-2" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Icon (Lucide Name)</label>
                                <input value={form.icon} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder="e.g. Wallet" />
                                <div className="mt-2 flex items-center gap-2 rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                    {(() => {
                                        const IconComponent = getIconComponent(form.icon);
                                        return <IconComponent className="h-4 w-4" />;
                                    })()}
                                    <span>Preview: {form.icon?.trim() ? form.icon : 'Circle'}</span>
                                    <span className="ml-auto h-4 w-4 rounded-full border" style={{ backgroundColor: form.color }} />
                                </div>
                            </div>
                            <label className="md:col-span-2 flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.is_default} onChange={(e) => setForm((prev) => ({ ...prev, is_default: e.target.checked }))} />
                                Mark as default
                            </label>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setIsOpen(false)} className="rounded border px-3 py-2 text-sm">Cancel</button>
                            <button onClick={submit} className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" disabled={createMutation.isPending || updateMutation.isPending}>
                                {form.id ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
