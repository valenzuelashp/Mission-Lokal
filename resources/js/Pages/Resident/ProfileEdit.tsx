import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';
import { FormEvent } from 'react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

// FIX: Cast incoming profile data structure straight to an open object schema to clear strict TS index errors
export default function ProfileEdit({ profile }: { profile: any }) {
    const { flash } = usePage<PageProps>().props;
    const { user } = useAuth();

    const { data, setData, post, processing, errors } = useForm({
        full_name: profile?.full_name ?? '',
        email: profile?.email ?? (user?.email ?? ''),
        mobile: profile?.mobile ?? (user?.mobile ?? ''),
        address: profile?.address ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/profile/edit');
    };

    return (
        <ResidentLayout>
            <Head title="Edit Profile" />
            <Button variant="ghost" className="mb-4 -ml-2" asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to profile
                </Link>
            </Button>

            <PageHeader
                title="Edit profile"
                description="Updates to name, contact, or address require barangay admin approval."
            />

            {flash.success && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {flash.success}
                </div>
            )}

            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                    Profile edits are reviewed by admin staff. You will keep using your current details until approved.
                </p>
            </div>

            <form onSubmit={submit} className="max-w-xl lg:max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Personal information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full name</Label>
                            <Input
                                id="full_name"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                            />
                            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile</Label>
                            <Input
                                id="mobile"
                                value={data.mobile}
                                onChange={(e) => setData('mobile', e.target.value)}
                            />
                            {errors.mobile && <p className="text-sm text-destructive">{errors.mobile}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={3}
                            />
                            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                        </div>
                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                                Submit for approval
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