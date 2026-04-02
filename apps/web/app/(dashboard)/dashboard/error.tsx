'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string; }; reset: () => void; }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Dashboard failed to load</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please retry this section.</p>
            <Button onClick={reset} className="mt-4">Reload Section</Button>
        </div>
    );
}
