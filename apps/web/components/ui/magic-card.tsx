'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MagicCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl dark:bg-slate-900/70',
                className
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.25),transparent_30%)]" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
