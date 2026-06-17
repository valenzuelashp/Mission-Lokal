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
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-primary" />
                    Before you submit
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Provide accurate names, dates, and locations. False statements may affect your civic standing.</p>
                <p>Staff will review your entry and contact you if mediation or follow-up is needed.</p>
            </CardContent>
        </Card>
    );

    return (
        <ResidentLayout wide>
            <Head title={titles[blotterType]} />

            <ResidentSocialShell right={rightAside}>
                <Button variant="ghost" className="-ml-2 w-fit" asChild>
                    <Link href="/blotter/new">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Choose blotter type
                    </Link>
                </Button>

                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <h1 className="text-xl font-bold">{titles[blotterType]}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isTwoParty
                                ? 'Formal complaint against another party. Admin will review and issue a ticket for barangay mediation.'
                                : 'Log an incident for barangay records. Staff may assign a search or welfare mission.'}
                        </p>
                    </CardContent>
                </Card>

                <form onSubmit={submit} className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Parties</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="complainant_name">Complainant (you)</Label>
                                <Input
                                    id="complainant_name"
                                    value={data.complainant_name}
                                    onChange={(e) => setData('complainant_name', e.target.value)}
                                />
                            </div>
                            {isTwoParty && (
                                <div className="space-y-2">
                                    <Label htmlFor="respondent_name">Respondent / other party</Label>
                                    <Input
                                        id="respondent_name"
                                        value={data.respondent_name}
                                        onChange={(e) => setData('respondent_name', e.target.value)}
                                        placeholder="Full name of the person complained against"
                                    />
                                    {errors.respondent_name && (
                                        <p className="text-sm text-destructive">{errors.respondent_name}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Incident details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="incident_date">Date</Label>
                                    <Input
                                        id="incident_date"
                                        type="date"
                                        value={data.incident_date}
                                        onChange={(e) => setData('incident_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="incident_time">Time</Label>
                                    <Input
                                        id="incident_time"
                                        type="time"
                                        value={data.incident_time}
                                        onChange={(e) => setData('incident_time', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={data.location}
                                    onChange={(e) => setData('location', e.target.value)}
                                    placeholder="Where did the incident occur?"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="statement">Statement of facts</Label>
                                <Textarea
                                    id="statement"
                                    value={data.statement}
                                    onChange={(e) => setData('statement', e.target.value)}
                                    placeholder="Describe what happened in detail…"
                                    rows={6}
                                />
                                {errors.statement && <p className="text-sm text-destructive">{errors.statement}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relief_sought">Relief sought</Label>
                                <Textarea
                                    id="relief_sought"
                                    value={data.relief_sought}
                                    onChange={(e) => setData('relief_sought', e.target.value)}
                                    placeholder="What outcome are you requesting from the barangay?"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.acknowledged}
                            onChange={(e) => setData('acknowledged', e.target.checked)}
                            className="mt-1 rounded border-gray-300"
                        />
                        <span>
                            I certify that the information provided is true to the best of my knowledge and I
                            understand this will be recorded as a formal barangay blotter entry.
                        </span>
                    </label>
                    {errors.acknowledged && <p className="text-sm text-destructive">{errors.acknowledged}</p>}

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" className="w-full sm:w-auto" disabled={processing || !data.acknowledged}>
                            Submit blotter
                        </Button>
                        <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                            <Link href="/blotter/new">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
