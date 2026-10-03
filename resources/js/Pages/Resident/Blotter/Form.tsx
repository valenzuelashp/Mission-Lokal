import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { FormEvent } from 'react';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { demoResidentProfile } from '@/Lib/residentDemo';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { BlotterFormPageProps, BlotterType } from '@/Types';

declare function route(name: string, parameters?: any, absolute?: boolean): string;

type Props = Partial<BlotterFormPageProps>;

const titles: Record<BlotterType, string> = {
    'two-party': 'Two-Party Dispute Blotter',
    'one-party': 'One-Party Official Incident Report',
};

export default function Form({ blotterType = 'two-party' }: Props) {
    const theme = useResidentTheme();
    const { auth } = usePage().props as any;
    const isMinor = auth?.user?.is_minor ?? false;
    const isTwoParty = blotterType === 'two-party';

    const { data, setData, post, processing, errors, transform } = useForm({
        type: blotterType,
        complainant_name: demoResidentProfile.full_name,
        respondent_name: '',
        incident_date: '',
        incident_time: '',
        location: '',
        statement: '',
        relief_sought: '',
        acknowledged: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        transform((formData) => ({
            type: formData.type === 'two-party' ? 'two_party' : 'one_party',
            respondent_name: isTwoParty ? formData.respondent_name : null,
            incident_at: formData.incident_date && formData.incident_time 
                ? `${formData.incident_date} ${formData.incident_time}` 
                : '',
            incident_address: formData.location,
            narrative: formData.statement,
            relief_sought: formData.relief_sought || null,
        }));

        post(route('blotter.store'));
    };

    const rightAside = (
        <>
            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <Shield className="h-4 w-4 text-blue-600" />
                        Katarungang Pambarangay Guidelines
                    </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-2.5 text-xs ${theme.textMuted} pt-3 font-medium leading-relaxed`}>
                    <p>Provide accurate names, timestamps, and locations. False statements affect civic standing.</p>
                    <p>Barangay staff review entries and issue mediation notices where applicable.</p>
                </CardContent>
            </Card>

            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Confidentiality Guarantee</CardTitle>
                </CardHeader>
                <CardContent className={`pt-3 text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                    <p>Sensitive disputes (VAWC, domestic safety) are strictly private and never published on public feeds.</p>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title={titles[blotterType]} />

            <ResidentSocialShell right={rightAside}>
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 w-fit cursor-pointer`} asChild>
                    <Link href={route('blotter.create')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Choose Blotter Category
                    </Link>
                </Button>

                {isMinor && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-900 shadow-2xs">
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                        <p className="leading-relaxed">
                            Minor accounts are restricted from filing standalone formal blotter complaints. Please have a parent or guardian submit this record.
                        </p>
                    </div>
                )}

                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-black tracking-tight">{titles[blotterType]}</h1>
                        <p className={`mt-1 text-xs sm:text-sm font-medium ${theme.textMuted}`}>
                            {isTwoParty
                                ? 'Formal complaint against another community member. Admin will review and issue a mediation ticket.'
                                : 'Log an incident for official records. Staff may assign an investigation or welfare mission.'}
                        </p>
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-4">
                    <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-4`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider">Involved Parties</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="complainant_name">Complainant (Your Profile)</Label>
                                <Input
                                    id="complainant_name"
                                    value={data.complainant_name}
                                    disabled
                                    className="bg-slate-50 text-slate-500 cursor-not-allowed font-bold"
                                />
                            </div>
                            {isTwoParty && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="respondent_name">Respondent / Other Party</Label>
                                    <Input
                                        id="respondent_name"
                                        value={data.respondent_name}
                                        onChange={(e) => setData('respondent_name', e.target.value)}
                                        placeholder="Full legal name of the respondent"
                                        disabled={isMinor}
                                        className={theme.inputBg}
                                    />
                                    {errors.respondent_name && (
                                        <p className="text-xs font-medium text-red-600">{errors.respondent_name}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                        <CardHeader className={`border-b ${theme.dividerColor} pb-4`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider">Incident Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="incident_date">Date of Incident</Label>
                                    <Input
                                        id="incident_date"
                                        type="date"
                                        value={data.incident_date}
                                        onChange={(e) => setData('incident_date', e.target.value)}
                                        disabled={isMinor}
                                        className={theme.inputBg}
                                    />
                                    {errors.incident_date && (
                                        <p className="text-xs font-medium text-red-600">The incident date field is required.</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="incident_time">Estimated Time</Label>
                                    <Input
                                        id="incident_time"
                                        type="time"
                                        value={data.incident_time}
                                        onChange={(e) => setData('incident_time', e.target.value)}
                                        disabled={isMinor}
                                        className={theme.inputBg}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="location">Exact Incident Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="House #, Street name, Zone"
                                    disabled={isMinor}
                                    className={theme.inputBg}
                                />
                                {errors.location && (
                                    <p className="text-xs font-medium text-red-600">{errors.location}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="statement">Statement of Facts (Narrative)</Label>
                                <Textarea
                                    id="statement"
                                    value={data.statement}
                                    onChange={(e) => setData('statement', e.target.value)}
                                    placeholder="Provide a detailed objective account of what transpired..."
                                    rows={6}
                                    disabled={isMinor}
                                    className={`resize-none ${theme.inputBg}`}
                                />
                                {errors.statement && <p className="text-xs font-medium text-red-600">{errors.statement}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="relief_sought">Relief Sought (Desired Resolution)</Label>
                                <Textarea
                                    id="relief_sought"
                                    value={data.relief_sought}
                                    onChange={(e) => setData('relief_sought', e.target.value)}
                                    placeholder="What specific resolution or mediation outcome are you requesting?"
                                    rows={3}
                                    disabled={isMinor}
                                    className={`resize-none ${theme.inputBg}`}
                                />
                                {errors.relief_sought && <p className="text-xs font-medium text-red-600">{errors.relief_sought}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="pt-2">
                        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border ${theme.cardBorder} p-4 ${theme.cardBg} text-xs font-bold shadow-2xs`}>
                            <input
                                type="checkbox"
                                checked={data.acknowledged}
                                onChange={(e) => setData('acknowledged', e.target.checked)}
                                disabled={isMinor}
                                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                            />
                            <span className="leading-relaxed">
                                I certify under oath that all facts stated herein are true and correct, and understand this enters official municipal files as a formal barangay blotter record.
                            </span>
                        </label>
                    </div>
                    {errors.acknowledged && <p className="text-xs font-medium text-red-600">{errors.acknowledged}</p>}

                    <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
                        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer" disabled={processing || !data.acknowledged || isMinor}>
                            {processing ? 'Filing Blotter...' : 'Submit Formal Blotter Record'}
                        </Button>
                        <Button type="button" variant="outline" className="w-full sm:w-auto font-bold text-xs py-3 cursor-pointer" asChild>
                            <Link href={route('blotter.create')}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}