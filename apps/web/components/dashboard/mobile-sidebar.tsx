'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';

type MobileNavLink = {
    href: '/dashboard' | '/dashboard/transactions' | '/dashboard/categories' | '/dashboard/users';
    label: string;
    roles: Array<'admin' | 'analyst' | 'viewer'>;
};

const links: MobileNavLink[] = [
    { href: '/dashboard', label: 'Overview', roles: [] },
    { href: '/dashboard/transactions', label: 'Transactions', roles: [] },
    { href: '/dashboard/categories', label: 'Categories', roles: [] },
    { href: '/dashboard/users', label: 'Users', roles: ['admin'] },
];

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void; }) {
    const userRole = useAuthStore((s) => s.user?.role);

    return (
        <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
            <SheetContent className="w-72 p-4 lg:hidden">
                <div className="mb-4">
                    <h2 className="font-semibold">Navigation</h2>
                </div>
                <nav className="space-y-2">
                    {links.map((item) => {
                        if (item.roles.length > 0 && (!userRole || !item.roles.includes(userRole))) {
                            return null;
                        }

                        return (
                            <Link key={item.href} href={item.href} onClick={onClose} className="block rounded-md px-3 py-2 hover:bg-muted">
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
