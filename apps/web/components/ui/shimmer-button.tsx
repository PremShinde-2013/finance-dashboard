'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type ShimmerButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(({ className, children, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                'relative inline-flex h-11 items-center justify-center overflow-hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-50',
                'before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] before:content-["\"] before:animate-[shimmer_1.8s_infinite]',
                className
            )}
            {...props}
        >
            <span className="relative z-10">{children}</span>
        </button>
    );
});

ShimmerButton.displayName = 'ShimmerButton';
