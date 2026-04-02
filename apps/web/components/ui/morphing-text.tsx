'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function MorphingText({ texts, className }: { texts: string[]; className?: string; }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (texts.length <= 1) return undefined;

        const timer = window.setInterval(() => {
            setIndex((current) => (current + 1) % texts.length);
        }, 1800);

        return () => window.clearInterval(timer);
    }, [texts]);

    if (texts.length === 0) return null;

    return (
        <div className={cn('relative h-7 overflow-hidden text-center text-sm text-slate-500', className)}>
            {texts.map((text, itemIndex) => (
                <span
                    key={text}
                    className={cn(
                        'absolute inset-0 flex items-center justify-center transition-all duration-500',
                        itemIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                    )}
                >
                    {text}
                </span>
            ))}
        </div>
    );
}
