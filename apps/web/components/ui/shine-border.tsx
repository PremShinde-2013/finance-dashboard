'use client';

import { cn } from '@/lib/utils';

export function ShineBorder({ className, shineColor = 'black' }: { className?: string; shineColor?: string; }) {
    const colorValue = shineColor === 'white' ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.75)';

    return (
        <div
            aria-hidden="true"
            className={cn('pointer-events-none absolute inset-0 rounded-[inherit] p-px', className)}
            style={{
                background: `linear-gradient(90deg, transparent, ${colorValue}, transparent)`,
                mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
            }}
        />
    );
}
