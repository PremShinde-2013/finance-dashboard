'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/page-header';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateUser, useDeleteUser, useHardDeleteUser, useUpdateUser, useUpdateUserRole, useUpdateUserStatus, useUsers } from '@/hooks/useUsers';

type UserForm = {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'analyst' | 'viewer';
    status: 'active' | 'inactive';
};

const initialUserForm: UserForm = {
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    status: 'active',
};

function roleBadgeVariant(role: string): 'danger' | 'default' | 'warning' {
    if (role === 'admin') return 'danger';
    if (role === 'analyst') return 'default';
    return 'warning';
}

export default function UsersPage() {
    const router = useRouter();
    const role = useAuthStore((state) => state.user?.role || 'viewer');

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<UserForm>(initialUserForm);

    useEffect(() => {
        if (role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [role, router]);

    const filters = useMemo(
        () => ({
            page,
            limit,
            search,
            role: roleFilter,
            status: statusFilter,
        }),
        [page, limit, search, roleFilter, statusFilter]
    );

    const { data, isLoading } = useUsers(filters);
    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();
    const updateRoleMutation = useUpdateUserRole();
    const updateStatusMutation = useUpdateUserStatus();
    const deleteMutation = useDeleteUser();
    const hardDeleteMutation = useHardDeleteUser();

    const rows = data?.rows || [];
    const meta = data?.meta;

    if (role !== 'admin') {
        return null;
    }

    const openCreate = () => {
        setForm(initialUserForm);
        setIsOpen(true);
    };

    const openEdit = (user: UserForm) => {
        setForm({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            status: user.status,
        });
        setIsOpen(true);
    };

    const submit = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error('Name and email are required');
            return;
        }

        try {
            if (form.id) {
                await updateMutation.mutateAsync({
                    id: form.id,
                    payload: {
                        name: form.name.trim(),
                        email: form.email.trim(),
                        role: form.role,
                        status: form.status,
                    },
                });
                toast.success('User updated');
            } else {
                if (form.password.length < 8) {
                    toast.error('Password must be at least 8 characters');
                    return;
                }
                await createMutation.mutateAsync({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    role: form.role,
                    status: form.status,
                });
                toast.success('User created');
            }

            setIsOpen(false);
            setForm(initialUserForm);
        } catch {
            toast.error('Failed to save user');
        }
    };

    const changeRole = async (id: string, value: string) => {
        try {
            await updateRoleMutation.mutateAsync({ id, role: value });
            toast.success('Role updated');
        } catch {
            toast.error('Failed to update role');
        }
    };

    const changeStatus = async (id: string, value: string) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status: value });
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const remove = async (id: string) => {
        if (!confirm('Soft delete this user?')) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('User marked inactive');
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const removeHard = async (id: string) => {
        if (!confirm('Permanently delete this user? This cannot be undone.')) return;
        try {
            await hardDeleteMutation.mutateAsync(id);
            toast.success('User permanently deleted');
        } catch {
            toast.error('Failed to permanently delete user');
        }
    };

    return (
        <div>
            <PageHeader title="Users" subtitle="Admin and manager role maintenance." />

            <div className="mb-4 grid gap-3 rounded-xl border bg-white/70 p-3 md:grid-cols-5">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name/email" className="rounded-md border px-3 py-2 text-sm" />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                    <option value="">All roles</option>
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))} className="rounded-md border px-3 py-2 text-sm">
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                    <option value="50">50 / page</option>
                </select>
                <div className="flex justify-end">
                    <button onClick={openCreate} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                        Create User
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white/70">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100/80 text-left">
                        <tr>
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Last Login</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <tr key={`user-skeleton-${index}`} className="border-t">
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-28" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-40" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-6 w-20" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-6 w-20" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-4 w-32" /></td>
                                    <td className="px-3 py-2"><Skeleton className="h-7 w-24" /></td>
                                </tr>
                            ))
                        ) : rows.length === 0 ? (
                            <tr>
                                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>No users found.</td>
                            </tr>
                        ) : (
                            rows.map((row: { id: string; name: string; email: string; role: string; status: string; last_login_at?: string; }) => (
                                <tr key={row.id} className="border-t">
                                    <td className="px-3 py-2">{row.name}</td>
                                    <td className="px-3 py-2">{row.email}</td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={row.role}
                                            onChange={(e) => changeRole(row.id, e.target.value)}
                                            className="rounded border px-2 py-1 text-xs"
                                        >
                                            <option value="admin">admin</option>
                                            <option value="analyst">analyst</option>
                                            <option value="viewer">viewer</option>
                                        </select>
                                        <div className="mt-1">
                                            <Badge variant={roleBadgeVariant(row.role)}>{row.role}</Badge>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={row.status}
                                            onChange={(e) => changeStatus(row.id, e.target.value)}
                                            className="rounded border px-2 py-1 text-xs"
                                        >
                                            <option value="active">active</option>
                                            <option value="inactive">inactive</option>
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">{row.last_login_at ? new Date(row.last_login_at).toLocaleString('en-IN') : '-'}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button className="rounded border px-2 py-1 text-xs" onClick={() => openEdit(row as UserForm)}>Edit</button>
                                            <button className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700" onClick={() => remove(row.id)}>Soft Delete</button>
                                            <button className="rounded border border-rose-500 px-2 py-1 text-xs text-rose-800" onClick={() => removeHard(row.id)}>Hard Delete</button>
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
                    <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={(meta?.page || page) <= 1} className="rounded border px-3 py-1 disabled:opacity-50">Previous</button>
                    <button onClick={() => setPage((prev) => prev + 1)} disabled={Boolean(meta && (meta.page >= meta.totalPages))} className="rounded border px-3 py-1 disabled:opacity-50">Next</button>
                </div>
            </div>

            {isOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
                        <h3 className="mb-3 text-lg font-semibold">{form.id ? 'Edit User' : 'Create User'}</h3>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Name</label>
                                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-medium text-slate-500">Email</label>
                                <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                            </div>
                            {!form.id ? (
                                <div className="md:col-span-2">
                                    <label className="text-xs font-medium text-slate-500">Password</label>
                                    <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                                </div>
                            ) : null}
                            <div>
                                <label className="text-xs font-medium text-slate-500">Role</label>
                                <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as 'admin' | 'analyst' | 'viewer' }))} className="mt-1 w-full rounded border px-3 py-2 text-sm">
                                    <option value="admin">admin</option>
                                    <option value="analyst">analyst</option>
                                    <option value="viewer">viewer</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500">Status</label>
                                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))} className="mt-1 w-full rounded border px-3 py-2 text-sm">
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </div>
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
