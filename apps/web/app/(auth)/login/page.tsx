'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackendWarmupCard } from '@/components/shared/backend-warmup-card';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const demoAccounts = [
    { role: 'Admin', email: 'admin@finance.dev', password: 'Admin@1234', accent: 'rose' },
    { role: 'Analyst', email: 'analyst@finance.dev', password: 'Analyst@1234', accent: 'indigo' },
    { role: 'Viewer', email: 'viewer@finance.dev', password: 'Viewer@1234', accent: 'slate' },
] as const;

export default function LoginPage() {
    const router = useRouter();
    const login = useLogin();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    const onSubmit = async (values: LoginFormValues) => {
        try {
            await login.mutateAsync(values);
            toast.success('Login successful');
            router.push('/dashboard');
        } catch {
            toast.error('Invalid credentials or API not reachable');
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-100 p-4">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-300/35 blur-3xl" />
                <div className="absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
                <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-300/30 backdrop-blur-xl md:grid-cols-2">
                    <section className="hidden border-r border-slate-200 p-10 text-slate-900 md:flex md:flex-col md:justify-between">
                        <div className="space-y-4">
                            <div className="inline-flex w-fit items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
                                Finance Dashboard
                            </div>
                            <h1 className="text-4xl font-semibold leading-tight">
                                Make decisions with
                                <span className="block bg-gradient-to-r from-cyan-600 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
                                    sharp financial clarity
                                </span>
                            </h1>
                            <p className="max-w-md text-sm text-slate-600">
                                Monitor income, control expenses, and track trends from one focused control room.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">Live analytics</div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">Role-based access</div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">Secure auth</div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">Fast workflows</div>
                        </div>
                    </section>

                    <section className="bg-white/85 p-6 sm:p-8 md:p-10">
                        <div className="mb-4">
                            <BackendWarmupCard visible={login.isPending} />
                        </div>

                        <Card className="border-none bg-transparent shadow-none">
                            <CardHeader className="px-0 pt-0">
                                <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    Secure Sign In
                                </div>
                                <CardTitle className="mt-4 text-3xl text-slate-900">Sign in</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Continue to your dashboard and keep your cash flow in focus.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-0 pb-0">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                                        <label className="text-sm font-medium text-slate-700">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            className="h-11 border-slate-300 bg-white shadow-sm focus-visible:ring-cyan-500"
                                            {...register('email')}
                                        />
                                        {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
                                    </div>

                                    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                                        <label className="text-sm font-medium text-slate-700">Password</label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                className="h-11 border-slate-300 bg-white pr-11 shadow-sm focus-visible:ring-cyan-500"
                                                {...register('password')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/20 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800"
                                        disabled={login.isPending}
                                    >
                                        {login.isPending ? 'Signing in...' : 'Sign In'}
                                    </Button>

                                    <p className="text-center text-sm text-slate-600">
                                        New here?{' '}
                                        <Link href="/register" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
                                            Create an account
                                        </Link>
                                    </p>

                                    <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demo login credentials</p>
                                        <div className="mt-3 grid gap-2 text-sm text-slate-700">
                                            {demoAccounts.map((account) => (
                                                <div key={account.role} className="rounded-lg border border-slate-200 bg-white p-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-slate-900">{account.role}</p>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                                account.accent === 'rose'
                                                                    ? 'bg-rose-100 text-rose-700'
                                                                    : account.accent === 'indigo'
                                                                      ? 'bg-indigo-100 text-indigo-700'
                                                                      : 'bg-slate-200 text-slate-700'
                                                            }`}
                                                        >
                                                            Reference
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-600">{account.email}</p>
                                                    <p className="text-xs text-slate-600">{account.password}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </main>
    );
}
