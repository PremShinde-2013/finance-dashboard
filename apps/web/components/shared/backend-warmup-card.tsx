'use client';

import { motion } from 'framer-motion';
import { Clock3, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BackendWarmupCardProps = {
    visible: boolean;
    className?: string;
};

export function BackendWarmupCard({ visible, className }: BackendWarmupCardProps) {
    if (!visible) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.88, rotateX: 24, rotateY: -14, filter: 'blur(8px)' }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                filter: 'blur(0px)',
            }}
            transition={{ type: 'spring', stiffness: 140, damping: 16, mass: 0.9 }}
            className="perspective-[1200px]"
        >
            <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            >
                <Card
                    className={cn(
                        'relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 via-white to-cyan-50 shadow-2xl shadow-amber-100/70',
                        className
                    )}
                >
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-10 top-4 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />
                        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />
                    </div>

                    <CardHeader className="relative space-y-3 pb-3">
                        <div className="flex items-center gap-3 text-amber-700">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-white/90 shadow-sm">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Please wait</span>
                        </div>
                        <CardTitle className="text-2xl text-slate-900">Hang tight! Your request is on its way! </CardTitle>
                    </CardHeader>

                    <CardContent className="relative space-y-4 text-sm leading-6 text-slate-700">
                        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-inner">
                                <Clock3 className="h-4 w-4" />
                            </div>
                            <p className="font-medium text-slate-800">
                                Render&apos;s free-tier backend may take 2-3 minutes to wake up after inactivity.
                            </p>
                        </div>

                        <p>
                            Don&apos;t worry - everything will be up and running smoothly in no time!
                        </p>

                        <div className="relative h-2 overflow-hidden rounded-full bg-amber-100/80">
                            <motion.div
                                className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400"
                                animate={{ x: ['-20%', '120%'] }}
                                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-amber-800">
                            <span>Thank you for your patience! </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Loading</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}