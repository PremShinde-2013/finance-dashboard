'use client';

import type { ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tags, ArrowLeftRight, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth';

type DesktopNavLink = {
    href: '/dashboard' | '/dashboard/transactions' | '/dashboard/categories' | '/dashboard/users';
    label: string;
    icon: ComponentType<{ className?: string; }>;
    roles: Array<'admin' | 'analyst' | 'viewer'>;
};

const links: DesktopNavLink[] = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: [] },
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, roles: [] },
    { href: '/dashboard/categories', label: 'Categories', icon: Tags, roles: [] },
    { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
];

export function Sidebar() {
    const pathname = usePathname();
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const userRole = useAuthStore((s) => s.user?.role);

    const onLogout = () => {
        clearSession();
        clearAuth();
        window.location.href = '/login';
    };

    return (
        <aside className="hidden w-72 border-r border-white/40 bg-white/65 p-5 backdrop-blur-xl lg:block">
            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Finance OS</p>
                <h2 className="text-xl font-semibold">Dashboard</h2>
            </div>

            <nav className="space-y-1">
                {links.map((item) => {
                    if (item.roles.length > 0 && (!userRole || !item.roles.includes(userRole))) {
                        return null;
                    }

                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                                active ? 'bg-primary text-primary-foreground' : 'hover:bg-white/70'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={onLogout}
                className="mt-8 flex w-full items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm hover:bg-muted"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </aside>
    );
}
