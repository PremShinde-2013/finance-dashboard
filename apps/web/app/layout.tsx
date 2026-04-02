import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
    title: 'Finance Dashboard',
    description: 'Finance dashboard with role-based analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
