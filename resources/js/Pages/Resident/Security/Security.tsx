import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { FormEvent } from 'react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { PasswordInput } from '@/Components/ui/password-input';
import { Label } from '@/Components/ui/label';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

declare function route(name: string, parameters?: any, absolute?: boolean): string;

export default function Security() {
    const theme = useResidentTheme();
    const { flash } = usePage<PageProps>().props;
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        put(route('profile.security.update'), {
            onSuccess: () => reset('current_password', 'password', 'password_confirmation'),
            preserveScroll: true
        });
    };

    return (
        <ResidentLayout wide>
            <Head title="Security Settings" />
            
            <div className="w-full space-y-6 pb-16">
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Link>
                </Button>

                <PageHeader title="Security Settings" description="Update your account password and authentication keys." />

                {flash.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit} className="w-full max-w-xl">
                    <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-5`}>
                            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                                <Shield className={`h-4 w-4 ${theme.primaryText}`} />
                                Change Account Password
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 sm:p-8">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <PasswordInput
                                    id="current_password"
                                    autoComplete="current-password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    className="rounded-2xl h-11 text-xs"
                                />
                                {errors.current_password && (
                                    <p className="text-xs font-medium text-destructive">{errors.current_password}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Complex Password</Label>
                                <PasswordInput
                                    id="password"
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="rounded-2xl h-11 text-xs"
                                />
                                {errors.password && <p className="text-xs font-medium text-destructive">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="rounded-2xl h-11 text-xs"
                                />
                            </div>
                            <div className={`flex flex-col gap-3 pt-4 border-t ${theme.dividerColor} sm:flex-row`}>
                                <Button type="submit" className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs py-3.5 sm:w-auto shadow-sm cursor-pointer rounded-2xl px-8 h-12`} disabled={processing}>
                                    {processing ? 'Updating Password...' : 'Update Password'}
                                </Button>
                                <Button type="button" variant="outline" className="w-full sm:w-auto font-black text-xs py-3.5 cursor-pointer rounded-2xl px-8 h-12" asChild>
                                    <Link href="/profile">Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </ResidentLayout>
    );
}