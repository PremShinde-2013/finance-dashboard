'use client';

import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Topbar({ onMenuClick }: { onMenuClick: () => void; }) {
    const user = useAuthStore((s) => s.user);

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/30 bg-white/70 px-4 backdrop-blur-xl">
            <button onClick={onMenuClick} className="rounded-md p-2 hover:bg-muted lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
            </button>
            <div className="ml-auto flex items-center gap-2">
                <div className="text-right">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.role || 'viewer'}</p>
                </div>
            </div>
        </header>
    );
}
