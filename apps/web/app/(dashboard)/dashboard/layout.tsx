'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { useMe } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const hydrated = useAuthStore((state) => state.hydrated);
    const [open, setOpen] = useState(false);

    useMe(hydrated && Boolean(token));

    useEffect(() => {
        if (hydrated && !token) {
            router.replace('/login');
        }
    }, [hydrated, router, token]);

    if (!hydrated) {
        return null;
    }

    if (!token) {
        return null;
    }

    return (
        <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#e0f2fe,transparent_42%),radial-gradient(circle_at_bottom_right,#fef3c7,transparent_38%),#f8fafc]">
            <div className="flex h-full">
                <Sidebar />
                <div className="flex h-full w-full flex-col overflow-hidden">
                    <Topbar onMenuClick={() => setOpen(true)} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
                </div>
            </div>
            <MobileSidebar open={open} onClose={() => setOpen(false)} />
        </div>
    );
}
