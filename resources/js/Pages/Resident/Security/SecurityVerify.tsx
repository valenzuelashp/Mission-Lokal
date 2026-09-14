import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { FormEvent } from 'react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import ResidentLayout from '@/Layouts/ResidentLayout';

declare function route(name: string, parameters?: any, absolute?: boolean): string;

export default function SecurityVerify({ email }: { email: string }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('profile.security.verify'));
    };

    return (
        <ResidentLayout>
            <Head title="Verify Identity" />
            <Button variant="ghost" className="mb-4 -ml-2" asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to profile
                </Link>
            </Button>

            <PageHeader title="Security Verification" description="Enter the 6-digit verification code sent to your email to proceed." />

            <form onSubmit={submit} className="max-w-xl lg:max-w-md">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <KeyRound className="h-4 w-4 text-blue-600" />
                            Email Verification Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800 flex items-center gap-2">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span>Code sent to: <strong>{email}</strong></span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="otp">6-Digit Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                className="text-center text-lg tracking-widest font-mono"
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value)}
                                required
                            />
                            {errors.otp && <p className="text-sm text-destructive">{errors.otp}</p>}
                        </div>

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto" disabled={processing}>
                                Verify Code
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