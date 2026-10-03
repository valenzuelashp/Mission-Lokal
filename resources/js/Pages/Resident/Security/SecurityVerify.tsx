import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { FormEvent } from 'react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

declare function route(name: string, parameters?: any, absolute?: boolean): string;

export default function SecurityVerify({ email }: { email: string }) {
    const theme = useResidentTheme();
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
            <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 mb-4 cursor-pointer`} asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                </Link>
            </Button>

            <PageHeader title="Security Verification" description="Enter the 6-digit cryptographic verification code sent to your email address." />

            <form onSubmit={submit} className="max-w-xl lg:max-w-md">
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardHeader className={`border-b ${theme.dividerColor} pb-4`}>
                        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                            <KeyRound className="h-4 w-4 text-blue-600" />
                            Email Verification OTP Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="rounded-xl bg-blue-50 p-3.5 text-xs font-bold text-blue-900 flex items-center gap-2.5 border border-blue-100">
                            <Mail className="h-4 w-4 shrink-0 text-blue-600" />
                            <span>Code dispatched to: <strong className="font-mono">{email}</strong></span>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="otp">6-Digit Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                className={`text-center text-xl tracking-widest font-mono h-12 ${theme.inputBg} font-bold`}
                                value={data.otp}
                                onChange={(e) => setData('otp', e.target.value)}
                                required
                            />
                            {errors.otp && <p className="text-xs font-medium text-destructive">{errors.otp}</p>}
                        </div>

                        <div className={`flex flex-col gap-2.5 pt-3 border-t ${theme.dividerColor} sm:flex-row`}>
                            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer" disabled={processing}>
                                {processing ? 'Verifying...' : 'Verify OTP Code'}
                            </Button>
                            <Button type="button" variant="outline" className="w-full sm:w-auto font-bold text-xs py-3 cursor-pointer" asChild>
                                <Link href="/profile">Cancel</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </ResidentLayout>
    );
}