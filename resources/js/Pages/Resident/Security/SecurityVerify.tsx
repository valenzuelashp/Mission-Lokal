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
        <ResidentLayout wide>
            <Head title="Verify Identity" />
            
            <div className="w-full space-y-6 pb-2">
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Link>
                </Button>

                <PageHeader title="Security Verification" description="Enter the 6-digit cryptographic verification code sent to your email address." />

                <form onSubmit={submit} className="w-full max-w-xl">
                    <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-5`}>
                            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
                                <KeyRound className={`h-4 w-4 ${theme.primaryText}`} />
                                Email Verification OTP Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 sm:p-8">
                            <div className={`rounded-2xl ${theme.badgeBg} p-4 text-xs font-bold ${theme.textMain} flex items-center gap-3 border ${theme.badgeBorder} shadow-2xs`}>
                                <Mail className={`h-5 w-5 shrink-0 ${theme.primaryText}`} />
                                <span>Code dispatched to: <strong className="font-mono">{email}</strong></span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="otp">6-Digit Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    maxLength={6}
                                    placeholder="123456"
                                    className={`text-center text-2xl tracking-widest font-mono h-14 ${theme.inputBg} font-black rounded-2xl`}
                                    value={data.otp}
                                    onChange={(e) => setData('otp', e.target.value)}
                                    required
                                />
                                {errors.otp && <p className="text-xs font-medium text-destructive">{errors.otp}</p>}
                            </div>

                            <div className={`flex flex-col gap-3 pt-4 border-t ${theme.dividerColor} sm:flex-row`}>
                                <Button type="submit" className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs py-3.5 sm:w-auto shadow-sm cursor-pointer rounded-2xl px-8 h-12`} disabled={processing}>
                                    {processing ? 'Verifying...' : 'Verify OTP Code'}
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