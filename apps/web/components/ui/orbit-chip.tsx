'use client';

import { motion } from 'framer-motion';

export function OrbitChip({ label }: { label: string; }) {
    return (
        <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
            {label}
        </motion.span>
    );
}
