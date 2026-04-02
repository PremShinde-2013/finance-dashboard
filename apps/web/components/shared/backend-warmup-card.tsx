'use client';

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
    <Card className={cn('border-amber-200 bg-gradient-to-br from-amber-50 via-white to-cyan-50 shadow-lg shadow-amber-100/60', className)}>
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-2 text-amber-700">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-[0.24em]">Please wait</span>
        </div>
        <CardTitle className="text-2xl text-slate-900">Hang tight! Your request is on its way! ⏳</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6 text-slate-700">
        <p>
          Since we&apos;re using Render&apos;s free-tier backend, the server may need a little time to spin up after inactivity.
          Typically, the first request can take around 2-3 minutes.
        </p>
        <p>
          Don&apos;t worry - everything will be up and running smoothly in no time! ⏱️
        </p>
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-amber-800">
          <Clock3 className="h-4 w-4" />
          <span>Thank you for your patience! 🌟</span>
        </div>
      </CardContent>
    </Card>
  );
}