'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export function Providers({ children }: { children: React.ReactNode; }) {
    const hydrate = useAuthStore((state) => state.hydrate);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30000,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return (
        <ThemeProvider attribute="class" forcedTheme="light" defaultTheme="light" enableSystem={false}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster richColors position="top-right" />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
