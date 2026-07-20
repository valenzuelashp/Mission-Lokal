import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { FormEvent } from 'react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

// Tell TypeScript that Ziggy's route function is globally available
declare function route(name: string, parameters?: any, absolute?: boolean): string;

export default function Security() {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        // Target backend route name dynamically via global routing provider
        put(route('profile.security.update'), {
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
            preserveScroll: true
        });
    };

    return (
        <ResidentLayout>
            <Head title="Security" />
            <Button variant="ghost" className="mb-4 -ml-2" asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to profile
                </Link>
            </Button>

            <PageHeader title="Security" description="Change your account password." />

            {flash.success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}

            <form onSubmit={submit} className="max-w-xl lg:max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="h-4 w-4" />
                            Change password
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                autoComplete="current-password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                            />
                            {errors.current_password && (
                                <p className="text-sm text-destructive">{errors.current_password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">New password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm new password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                                Update password
                            </Button>
                            <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                                <Link href="/profile">Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </ResidentLayout>
    );
}