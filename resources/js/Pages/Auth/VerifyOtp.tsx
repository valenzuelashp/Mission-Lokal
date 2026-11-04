import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import OtpInput from '@/Components/shared/OtpInput';

interface Props { email: string; }

export default function VerifyOtp({ email }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        otp: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        post(window.route('password.otp.verify'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Head title="Verify OTP" />
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Enter OTP Security Code</CardTitle>
                    <CardDescription>We sent a 6-digit verification code to your email inbox. Please type it below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <input type="hidden" value={data.email} />
                        <div>
                            <OtpInput value={data.otp} onChange={(otp) => setData('otp', otp)} error={errors.otp} />
                        </div>
                        <Button className="w-full" type="submit" disabled={processing}>
                            {processing ? 'Verifying...' : 'Verify Code'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}