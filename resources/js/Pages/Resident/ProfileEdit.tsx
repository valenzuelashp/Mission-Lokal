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
        <ResidentLayout>
            <Head title="Edit Profile" />
            <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 mb-4 cursor-pointer`} asChild>
                <Link href="/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile Dashboard
                </Link>
            </Button>

            <PageHeader
                title="Update Profile Details"
                description="Modifications to your legal name, contact information, or address are submitted to barangay administration for security verification."
            />

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 shadow-2xs">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="leading-relaxed">
                    Profile updates require manual staff review. You will continue operating under your current verified details until verification completes.
                </p>
            </div>

            <form onSubmit={submit} className="max-w-xl lg:max-w-2xl">
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardHeader className={`border-b ${theme.dividerColor} pb-4`}>
                        <CardTitle className="text-sm font-black uppercase tracking-wider">Personal Information Form</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="full_name">Registered Full Name</Label>
                            <Input
                                id="full_name"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                required
                                className={theme.inputBg}
                            />
                            {errors.full_name && <p className="text-xs font-medium text-destructive">{errors.full_name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={theme.inputBg}
                            />
                            {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                value={data.mobile}
                                onChange={(e) => setData('mobile', e.target.value)}
                                className={theme.inputBg}
                            />
                            {errors.mobile && <p className="text-xs font-medium text-destructive">{errors.mobile}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="address">Physical Residence Address</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={3}
                                className={`resize-none ${theme.inputBg}`}
                            />
                            {errors.address && <p className="text-xs font-medium text-destructive">{errors.address}</p>}
                        </div>
                        <div className={`flex flex-col gap-2.5 pt-3 border-t ${theme.dividerColor} sm:flex-row`}>
                            <Button type="submit" className={`w-full ${theme.primaryBg} ${theme.primaryHover} text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer`} disabled={processing}>
                                {processing ? 'Submitting...' : 'Submit Profile Updates for Review'}
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