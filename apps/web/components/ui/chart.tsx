'use client';

import * as React from 'react';
import { Tooltip as RechartsTooltip } from 'recharts';
import type { TooltipProps } from 'recharts/types/component/DefaultTooltipContent';

import { cn } from '@/lib/utils';

export type ChartConfig = Record<
    string,
    {
        label?: React.ReactNode;
        color?: string;
    }
>;

type ChartContextValue = {
    config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
    const context = React.useContext(ChartContext);

    if (!context) {
        throw new Error('Chart components must be used within a ChartContainer.');
    }

    return context;
}

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
};

export function ChartContainer({ config, className, style, children, ...props }: ChartContainerProps) {
    const colorVars = React.useMemo(() => {
        return Object.entries(config).reduce<Record<string, string>>((accumulator, [key, value]) => {
            if (value.color) {
                accumulator[`--color-${key}`] = value.color;
            }

            return accumulator;
        }, {});
    }, [config]);

    return (
        <ChartContext.Provider value={{ config }}>
            <div className={cn('h-full w-full', className)} style={{ ...colorVars, ...style }} {...props}>
                {children}
            </div>
        </ChartContext.Provider>
    );
}

export function ChartTooltip(props: React.ComponentPropsWithoutRef<typeof RechartsTooltip>) {
    return <RechartsTooltip {...props} />;
}

type ChartTooltipContentProps = TooltipProps<number, string> & {
    indicator?: 'dot' | 'line' | 'dashed';
    labelFormatter?: (value: string) => string;
    valueFormatter?: (value: number) => string;
    className?: string;
};

export function ChartTooltipContent({
    active,
    payload,
    label,
    indicator = 'dot',
    labelFormatter,
    valueFormatter,
    className,
}: ChartTooltipContentProps) {
    const { config } = useChart();

    if (!active || !payload?.length) {
        return null;
    }

    const displayLabel = typeof label === 'string' && labelFormatter ? labelFormatter(label) : String(label ?? '');

    return (
        <div className={cn('rounded-lg border bg-background p-3 text-sm shadow-sm', className)}>
            {displayLabel ? <div className="mb-2 font-medium text-foreground">{displayLabel}</div> : null}
            <div className="space-y-1">
                {payload.map((item) => {
                    const dataKey = String(item.dataKey ?? item.name ?? '');
                    const entry = config[dataKey];
                    const value = typeof item.value === 'number' ? item.value : Number(item.value);
                    const formattedValue = Number.isFinite(value)
                        ? valueFormatter?.(value) ?? value.toLocaleString('en-IN')
                        : String(item.value ?? '');

                    return (
                        <div key={dataKey} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'inline-flex shrink-0 rounded-full',
                                        indicator === 'dot' && 'h-2 w-2',
                                        indicator === 'line' && 'h-0.5 w-3',
                                        indicator === 'dashed' && 'h-0.5 w-3 border-t border-dashed',
                                    )}
                                    style={{ backgroundColor: item.color || entry?.color || 'currentColor' }}
                                />
                                <span className="text-muted-foreground">{entry?.label ?? item.name ?? dataKey}</span>
                            </div>
                            <span className="font-medium text-foreground">{formattedValue}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}