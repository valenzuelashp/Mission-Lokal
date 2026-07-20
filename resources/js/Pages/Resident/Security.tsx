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

export default function Security() {
    const { flash } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/profile/security');
    };

    return (
        <ResidentLayout wide>
            <Head title="Account Security" />

            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 max-w-xl mx-auto px-2 sm:px-4 py-2 space-y-4">
                <Button variant="ghost" className="h-8 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2 -ml-1" asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to Profile
                    </Link>
                </Button>

                <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                    <PageHeader title="Security" description="Modify or cycle your baseline profile encryption pass keys safely." />
                </div>

                {flash.success && (
                    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs font-bold text-neutral-800 shadow-sm">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit} className="w-full">
                    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-neutral-100/70 px-4 py-3">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-neutral-400" /> Pass Key Update
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-xs font-bold text-neutral-700">
                            <div className="space-y-1.5">
                                <Label htmlFor="current_password" className="text-[11px] uppercase tracking-wider text-neutral-500">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    autoComplete="current-password"
                                    className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 font-medium text-neutral-900"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                />
                                {errors.current_password && (
                                    <p className="text-[11px] font-medium text-red-600 mt-1">{errors.current_password}</p>
                                )}
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-[11px] uppercase tracking-wider text-neutral-500">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 font-medium text-neutral-900"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="text-[11px] font-medium text-red-600 mt-1">{errors.password}</p>}
                            </div>
                            
                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-[11px] uppercase tracking-wider text-neutral-500">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 font-medium text-neutral-900"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                                <Button type="submit" className="h-9 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold px-4" disabled={processing}>
                                    Update Password
                                </Button>
                                <Button type="button" variant="outline" className="h-9 rounded-xl border-neutral-200 text-neutral-700 text-xs font-bold px-4" asChild>
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