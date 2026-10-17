import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

export default function ProfileEdit({ profile }: { profile: any }) {
    const theme = useResidentTheme();
    const { user } = useAuth();

    const { data, setData, post, processing, errors } = useForm({
        full_name: profile?.full_name ?? (user ? `${user.first_name} ${user.last_name}` : ''),
        email: profile?.email ?? (user?.email ?? ''),
        mobile: profile?.mobile ?? (user?.mobile ?? ''),
        address: profile?.address ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/edit');
    };

    return (
        <ResidentLayout wide>
            <Head title="Edit Profile" />

            <div className="w-full space-y-6 pb-16">
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile Dashboard
                    </Link>
                </Button>

                <PageHeader
                    title="Update Profile Details"
                    description="Modifications to your legal name, contact information, or address are submitted to barangay administration for security verification."
                />

                <div className={`mb-6 flex items-start gap-3 rounded-2xl border ${theme.badgeBorder} ${theme.badgeBg} p-5 text-xs font-bold shadow-2xs`}>
                    <Clock className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                    <p className={`leading-relaxed ${theme.textMain}`}>
                        Profile updates require manual staff review. You will continue operating under your current verified details until verification completes.
                    </p>
                </div>

                <form onSubmit={submit} className="w-full max-w-3xl">
                    <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-5`}>
                            <CardTitle className={`text-sm font-black uppercase tracking-wider ${theme.textMain}`}>Personal Information Form</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 p-6 sm:p-8">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Registered Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    required
                                    className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                />
                                {errors.full_name && <p className="text-xs font-medium text-destructive">{errors.full_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                />
                                {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    value={data.mobile}
                                    onChange={(e) => setData('mobile', e.target.value)}
                                    className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                />
                                {errors.mobile && <p className="text-xs font-medium text-destructive">{errors.mobile}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Physical Residence Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    rows={3}
                                    className={`resize-none ${theme.inputBg} rounded-2xl p-4 text-xs`}
                                />
                                {errors.address && <p className="text-xs font-medium text-destructive">{errors.address}</p>}
                            </div>
                            <div className={`flex flex-col gap-3 pt-4 border-t ${theme.dividerColor} sm:flex-row`}>
                                <Button type="submit" className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs py-3.5 sm:w-auto shadow-sm cursor-pointer rounded-2xl px-8 h-12`} disabled={processing}>
                                    {processing ? 'Submitting...' : 'Submit Profile Updates for Review'}
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