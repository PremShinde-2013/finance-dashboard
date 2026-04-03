'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Tags, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { clearSession } from '@/lib/auth';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type MobileNavLink = {
    href: '/dashboard' | '/dashboard/transactions' | '/dashboard/categories' | '/dashboard/users';
    label: string;
    icon: React.ComponentType<{ className?: string; }>;
    roles: Array<'admin' | 'analyst' | 'viewer'>;
};

const links: MobileNavLink[] = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: [] },
    { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, roles: [] },
    { href: '/dashboard/categories', label: 'Categories', icon: Tags, roles: [] },
    { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['admin'] },
];

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void; }) {
    const pathname = usePathname();
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const userName = useAuthStore((s) => s.user?.name || 'User');
    const userRole = useAuthStore((s) => s.user?.role);

    const onLogout = () => {
        clearSession();
        clearAuth();
        onClose();
        window.location.href = '/login';
    };

    return (
        <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
            <SheetContent className="flex w-72 flex-col border-r border-white/40 bg-gradient-to-b from-white via-white to-slate-50/90 p-4 lg:hidden">
                <div className="mb-5 rounded-xl border border-white/60 bg-white/80 p-3 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Finance OS</p>
                    <h2 className="mt-1 text-base font-semibold">Dashboard</h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {userName} • {userRole || 'viewer'}
                    </p>
                </div>

                <nav className="space-y-1.5">
                    {links.map((item) => {
                        if (item.roles.length > 0 && (!userRole || !item.roles.includes(userRole))) {
                            return null;
                        }

                        const active = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-slate-700 hover:bg-white hover:text-slate-900'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={onLogout}
                    className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </SheetContent>
        </Sheet>
    );
}
