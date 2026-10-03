import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { ShieldAlert, ArrowLeft, UserCog } from 'lucide-react';
import PageHeader from '@/Components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

export default function ProfileEdit({ profile }: { profile: any }) {
    const theme = useResidentTheme();
    const { data, setData, post, processing, errors } = useForm({
        first_name: profile?.first_name || '',
        middle_name: profile?.middle_name || '',
        last_name: profile?.last_name || '',
        name_extension: profile?.name_extension || '',
        birthday: profile?.birthday || '',
        house_street: profile?.house_street || '',
        barangay_name: profile?.barangay_name || '',
        city: profile?.city || '',
        province: profile?.province || '',
        email: profile?.email || '',
        mobile: profile?.mobile || '',
        parent_name: profile?.parent_name || '',
        parent_contact: profile?.parent_contact || '',
    });

    const isMinor = profile?.is_minor || false;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/edit');
    };

    return (
        <ResidentLayout>
            <Head title="Edit Profile" />

            <div className="mb-4">
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile Dashboard
                    </Link>
                </Button>
            </div>

            <div className="mx-auto max-w-2xl space-y-6">
                <PageHeader
                    title="Update Profile Details"
                    description="Modify your personal, contact, or address information. Changes will be submitted to barangay administration for review."
                />

                <form onSubmit={submit} className="space-y-5">
                    <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-4 bg-slate-50/40`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                                <UserCog className="h-4 w-4 text-blue-600" /> Personal Identity Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>First Name *</Label>
                                    <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required className={theme.inputBg} />
                                    {errors.first_name && <span className="text-xs font-medium text-destructive">{errors.first_name}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Middle Name</Label>
                                    <Input value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} className={theme.inputBg} />
                                    {errors.middle_name && <span className="text-xs font-medium text-destructive">{errors.middle_name}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Last Name *</Label>
                                    <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required className={theme.inputBg} />
                                    {errors.last_name && <span className="text-xs font-medium text-destructive">{errors.last_name}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Name Extension</Label>
                                    <Input placeholder="e.g. Jr., III" value={data.name_extension} onChange={(e) => setData('name_extension', e.target.value)} className={theme.inputBg} />
                                    {errors.name_extension && <span className="text-xs font-medium text-destructive">{errors.name_extension}</span>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Birthday *</Label>
                                <Input type="date" value={data.birthday} onChange={(e) => setData('birthday', e.target.value)} required className={theme.inputBg} />
                                {errors.birthday && <span className="text-xs font-medium text-destructive">{errors.birthday}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-4 bg-slate-50/40`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider">Residential Address Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="space-y-1.5">
                                <Label>House / Street Address *</Label>
                                <Input value={data.house_street} onChange={(e) => setData('house_street', e.target.value)} required className={theme.inputBg} />
                                {errors.house_street && <span className="text-xs font-medium text-destructive">{errors.house_street}</span>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-1.5">
                                    <Label>Barangay *</Label>
                                    <Input value={data.barangay_name} onChange={(e) => setData('barangay_name', e.target.value)} required className={theme.inputBg} />
                                    {errors.barangay_name && <span className="text-xs font-medium text-destructive">{errors.barangay_name}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>City / Municipality *</Label>
                                    <Input value={data.city} onChange={(e) => setData('city', e.target.value)} required className={theme.inputBg} />
                                    {errors.city && <span className="text-xs font-medium text-destructive">{errors.city}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Province *</Label>
                                    <Input value={data.province} onChange={(e) => setData('province', e.target.value)} required className={theme.inputBg} />
                                    {errors.province && <span className="text-xs font-medium text-destructive">{errors.province}</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-4 bg-slate-50/40`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider">Contact Channels</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-5">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Email Address *</Label>
                                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required className={theme.inputBg} />
                                    {errors.email && <span className="text-xs font-medium text-destructive">{errors.email}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Mobile Number *</Label>
                                    <Input value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} required className={theme.inputBg} />
                                    {errors.mobile && <span className="text-xs font-medium text-destructive">{errors.mobile}</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {isMinor && (
                        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-2xs">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                Parent / Guardian Information
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label>Guardian Name *</Label>
                                    <Input value={data.parent_name} onChange={(e) => setData('parent_name', e.target.value)} required={isMinor} className={theme.inputBg} />
                                    {errors.parent_name && <span className="text-xs font-medium text-destructive">{errors.parent_name}</span>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Guardian Contact *</Label>
                                    <Input value={data.parent_contact} onChange={(e) => setData('parent_contact', e.target.value)} required={isMinor} className={theme.inputBg} />
                                    {errors.parent_contact && <span className="text-xs font-medium text-destructive">{errors.parent_contact}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`flex justify-end gap-3 border-t ${theme.dividerColor} pt-5`}>
                        <Button type="button" variant="outline" className="font-bold text-xs cursor-pointer" asChild>
                            <Link href="/profile">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-sm">
                            {processing ? 'Submitting...' : 'Submit Profile Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </ResidentLayout>
    );
}