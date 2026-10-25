import { useState, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

export default function ProfileEdit({ profile }: { profile: any }) {
    const theme = useResidentTheme();
    const { user } = useAuth();

    // Determine the absolute max date available (12 years ago from today)
    const [maxDateString] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 12);
        return d.toISOString().split('T')[0];
    });

    const { data, setData, post, processing, errors } = useForm({
        first_name: profile?.first_name ?? (user?.first_name ?? ''),
        middle_name: profile?.middle_name ?? (user?.middle_name ?? ''),
        last_name: profile?.last_name ?? (user?.last_name ?? ''),
        name_extension: profile?.name_extension ?? (user?.name_extension ?? ''),
        email: profile?.email ?? (user?.email ?? ''),
        mobile: profile?.mobile ?? (user?.mobile ?? ''),
        birthday: profile?.birthday ?? '',
        house_street: profile?.house_street ?? '',
        barangay_name: profile?.barangay_name ?? '',
        city: profile?.city ?? '',
        province: profile?.province ?? '',
        parent_name: profile?.parent_name ?? '',
        parent_contact: profile?.parent_contact ?? '',
    });

    // Dynamically calculate if the selected birthday makes them a minor (under 18)
    const isMinor = useMemo(() => {
        if (!data.birthday) return false;
        const bday = new Date(data.birthday);
        const ageDifMs = Date.now() - bday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) < 18;
    }, [data.birthday]);

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
                            
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value.toUpperCase())}
                                        required
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.first_name && <p className="text-xs font-medium text-destructive">{errors.first_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                    <Input
                                        id="middle_name"
                                        value={data.middle_name}
                                        onChange={(e) => setData('middle_name', e.target.value.toUpperCase())}
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.middle_name && <p className="text-xs font-medium text-destructive">{errors.middle_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value.toUpperCase())}
                                        required
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.last_name && <p className="text-xs font-medium text-destructive">{errors.last_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name_extension">Name Extension (Optional)</Label>
                                    <Input
                                        id="name_extension"
                                        placeholder="e.g. JR, SR, III"
                                        value={data.name_extension}
                                        onChange={(e) => setData('name_extension', e.target.value.toUpperCase())}
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.name_extension && <p className="text-xs font-medium text-destructive">{errors.name_extension}</p>}
                                </div>
                            </div>

                            {/* Contact Fields */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        pattern=".*@gmail\.com$"
                                        title="Please provide a valid @gmail.com address."
                                        className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.email && <p className="text-xs font-medium text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        placeholder="09123456789"
                                        value={data.mobile}
                                        onChange={(e) => {
                                            const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            setData('mobile', numericValue);
                                        }}
                                        required
                                        pattern="^09[0-9]{9}$"
                                        title="Phone number must start with 09 and be exactly 11 digits long."
                                        maxLength={11}
                                        className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.mobile && <p className="text-xs font-medium text-destructive">{errors.mobile}</p>}
                                </div>
                            </div>

                            {/* Demographics & Address */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="birthday">Birthday (Must be 12+ years old)</Label>
                                    <Input
                                        id="birthday"
                                        type="date"
                                        max={maxDateString}
                                        value={data.birthday}
                                        onChange={(e) => setData('birthday', e.target.value)}
                                        required
                                        className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.birthday && <p className="text-xs font-medium text-destructive">{errors.birthday}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="house_street">House / Street</Label>
                                    <Input
                                        id="house_street"
                                        value={data.house_street}
                                        onChange={(e) => setData('house_street', e.target.value.toUpperCase())}
                                        required
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.house_street && <p className="text-xs font-medium text-destructive">{errors.house_street}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="barangay_name">Barangay Name</Label>
                                    <Input
                                        id="barangay_name"
                                        value={data.barangay_name}
                                        onChange={(e) => setData('barangay_name', e.target.value.toUpperCase())}
                                        required
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.barangay_name && <p className="text-xs font-medium text-destructive">{errors.barangay_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City/Municipality</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value.toUpperCase())}
                                        required
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.city && <p className="text-xs font-medium text-destructive">{errors.city}</p>}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value.toUpperCase())}
                                        required
                                        className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                    />
                                    {errors.province && <p className="text-xs font-medium text-destructive">{errors.province}</p>}
                                </div>
                            </div>

                            {/* Parent / Guardian Info (Dynamic based on selected age) */}
                            {isMinor && (
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 pt-4 border-t">
                                    <div className="space-y-2 md:col-span-2">
                                        <p className="text-xs font-semibold text-amber-600">
                                            Parent/Guardian details are required for minors.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                                        <Input
                                            id="parent_name"
                                            value={data.parent_name}
                                            onChange={(e) => setData('parent_name', e.target.value.toUpperCase())}
                                            required={isMinor}
                                            className={`${theme.inputBg} uppercase rounded-2xl h-11 text-xs`}
                                        />
                                        {errors.parent_name && <p className="text-xs font-medium text-destructive">{errors.parent_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parent_contact">Parent/Guardian Contact</Label>
                                        <Input
                                            id="parent_contact"
                                            placeholder="09123456789"
                                            value={data.parent_contact}
                                            onChange={(e) => {
                                                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 11);
                                                setData('parent_contact', numericValue);
                                            }}
                                            required={isMinor}
                                            pattern="^09[0-9]{9}$"
                                            title="Phone number must start with 09 and be exactly 11 digits long."
                                            maxLength={11}
                                            className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                        />
                                        {errors.parent_contact && <p className="text-xs font-medium text-destructive">{errors.parent_contact}</p>}
                                    </div>
                                </div>
                            )}

                            <div className={`flex flex-col gap-3 pt-6 border-t ${theme.dividerColor} sm:flex-row`}>
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