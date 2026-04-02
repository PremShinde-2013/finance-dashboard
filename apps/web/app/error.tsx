'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string; }; reset: () => void; }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center">
                <h1 className="text-xl font-semibold">Something went wrong</h1>
                <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred. Try again.</p>
                <Button onClick={reset} className="mt-4">Try Again</Button>
            </div>
        </main>
    );
}
