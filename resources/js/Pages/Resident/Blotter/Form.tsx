import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { FormEvent } from 'react';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { demoResidentProfile } from '@/Lib/residentDemo';
import type { BlotterFormPageProps, BlotterType } from '@/Types';

type Props = Partial<BlotterFormPageProps>;

const titles: Record<BlotterType, string> = {
    'two-party': 'Two-party blotter',
    'one-party': 'One-party report',
};

export default function Form({ blotterType = 'two-party' }: Props) {
    const isTwoParty = blotterType === 'two-party';

    const { data, setData, post, processing, errors } = useForm({
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
        post('/blotter');
    };

    const rightAside = (
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4">
            <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-neutral-400" /> Before you submit
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs font-medium text-neutral-500 space-y-2 leading-relaxed">
                <p>Provide accurate names, dates, and locations. False statements may affect your civic standing.</p>
                <p>Staff will review your entry and contact you if mediation or follow-up is needed.</p>
            </CardContent>
        </Card>
    );

    return (
        <ResidentLayout wide>
            <Head title={titles[blotterType]} />

            {/* Fine Light Background Canvas */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 space-y-4 w-full px-2 sm:px-4 md:px-6">
                <Button variant="ghost" className="h-8 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2 -ml-1" asChild>
                    <Link href="/blotter/new">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Choose blotter type
                    </Link>
                </Button>

                <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                    <CardContent className="p-4">
                        <h1 className="text-sm font-black tracking-wider text-neutral-950 uppercase">{titles[blotterType]}</h1>
                        <p className="mt-1 text-xs font-medium text-neutral-400 leading-relaxed">
                            {isTwoParty
                                ? 'Formal complaint against another party. Admin will review and issue a ticket for barangay mediation.'
                                : 'Log an incident for barangay records. Staff may assign a search or welfare mission.'}
                        </p>
                    </CardContent>
                </Card>

                <ResidentSocialShell right={rightAside}>
                    <form onSubmit={submit} className="space-y-4 text-xs font-bold text-neutral-700">
                        {/* Parties Card */}
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-neutral-100/70 px-4 py-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Parties</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="complainant_name" className="text-[11px] uppercase tracking-wider text-neutral-500">Complainant (you)</Label>
                                    <Input
                                        id="complainant_name"
                                        className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium"
                                        value={data.complainant_name}
                                        onChange={(e) => setData('complainant_name', e.target.value)}
                                    />
                                </div>
                                {isTwoParty && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="respondent_name" className="text-[11px] uppercase tracking-wider text-neutral-500">Respondent / other party</Label>
                                        <Input
                                            id="respondent_name"
                                            className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium"
                                            value={data.respondent_name}
                                            onChange={(e) => setData('respondent_name', e.target.value)}
                                            placeholder="Full name of the person complained against"
                                        />
                                        {errors.respondent_name && (
                                            <p className="text-[11px] font-medium text-red-600 mt-1">{errors.respondent_name}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Incident details Card */}
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-neutral-100/70 px-4 py-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Incident details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid gap-4 grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="incident_date" className="text-[11px] uppercase tracking-wider text-neutral-500">Date</Label>
                                        <Input
                                            id="incident_date"
                                            type="date"
                                            className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium"
                                            value={data.incident_date}
                                            onChange={(e) => setData('incident_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="incident_time" className="text-[11px] uppercase tracking-wider text-neutral-500">Time</Label>
                                        <Input
                                            id="incident_time"
                                            type="time"
                                            className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium"
                                            value={data.incident_time}
                                            onChange={(e) => setData('incident_time', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="location" className="text-[11px] uppercase tracking-wider text-neutral-500">Location</Label>
                                    <Input
                                        id="location"
                                        className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                        placeholder="Where did the incident occur?"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="statement" className="text-[11px] uppercase tracking-wider text-neutral-500">Statement of facts</Label>
                                    <Textarea
                                        id="statement"
                                        className="rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium leading-relaxed"
                                        value={data.statement}
                                        onChange={(e) => setData('statement', e.target.value)}
                                        placeholder="Describe what happened in detail…"
                                        rows={5}
                                    />
                                    {errors.statement && <p className="text-[11px] font-medium text-red-600 mt-1">{errors.statement}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="relief_sought" className="text-[11px] uppercase tracking-wider text-neutral-500">Relief sought</Label>
                                    <Textarea
                                        id="relief_sought"
                                        className="rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium leading-relaxed"
                                        value={data.relief_sought}
                                        onChange={(e) => setData('relief_sought', e.target.value)}
                                        placeholder="What outcome are you requesting from the barangay?"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms Acknowledgment Box Layout */}
                        <label className="flex items-start gap-2.5 text-[11px] font-medium text-neutral-500 leading-relaxed px-1 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.acknowledged}
                                onChange={(e) => setData('acknowledged', e.target.checked)}
                                className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            <span>
                                I certify that the information provided is true to the best of my knowledge and I understand this will be recorded as a formal barangay blotter entry.
                            </span>
                        </label>
                        {errors.acknowledged && <p className="text-[11px] font-medium text-red-600 px-1">{errors.acknowledged}</p>}

                        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                            <Button type="submit" className="h-9 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold px-4 shadow-sm" disabled={processing || !data.acknowledged}>
                                Submit blotter
                            </Button>
                            <Button type="button" variant="outline" className="h-9 rounded-xl border-neutral-200 text-neutral-700 text-xs font-bold px-4" asChild>
                                <Link href="/blotter/new">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}