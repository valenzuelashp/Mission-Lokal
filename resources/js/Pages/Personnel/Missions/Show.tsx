import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Camera, CircleAlert, Phone, Shield } from 'lucide-react';
import CompactMissionStatus from '@/Components/personnel/CompactMissionStatus';
import MissionChecklist from '@/Components/personnel/MissionChecklist';
import MissionStatusBadge from '@/Components/personnel/MissionStatusBadge';
import MapView from '@/Components/maps/MapView';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { demoPersonnelMissions } from '@/Lib/personnelDemo';
import type { MissionStatus, PageProps, PersonnelMissionPageProps } from '@/Types';

type TimelineState = 'done' | 'current' | 'upcoming';

function stepState(done: boolean, current = false): TimelineState {
    if (done) return 'done';
    if (current) return 'current';
    return 'upcoming';
}

const nextStatus: Partial<Record<MissionStatus, { label: string; status: MissionStatus }>> = {
    assigned: { label: 'Acknowledge', status: 'acknowledged' },
    acknowledged: { label: 'Start work', status: 'in_progress' },
};

export default function Show(props: Partial<PersonnelMissionPageProps>) {
    const mission = props.mission ?? demoPersonnelMissions[0];
    const { flash } = usePage<PageProps>().props;

    const action = nextStatus[mission.status];
    const readonly = ['completed', 'verified', 'cancelled'].includes(mission.status);
    const needsProof = mission.status === 'in_progress' && !mission.proof_submitted;

    const timeline = [
        { key: 'assigned', label: 'Assigned', at: mission.assigned_at, state: 'done' as TimelineState },
        {
            key: 'ack',
            label: 'Acknowledged',
            state: stepState(['acknowledged', 'in_progress', 'completed', 'verified'].includes(mission.status)),
        },
        {
            key: 'progress',
            label: 'In progress',
            state: stepState(
                ['completed', 'verified'].includes(mission.status),
                mission.status === 'in_progress',
            ),
        },
        {
            key: 'completed',
            label: 'Completed',
            state: stepState(['completed', 'verified'].includes(mission.status)),
        },
    ];

    const updateStatus = (status: MissionStatus) => {
        router.patch(`/personnel/missions/${mission.id}/status`, { status }, { preserveScroll: true });
    };

    return (
        <PersonnelLayout title={`Mission-Lokal Personnel: ${mission.id}`}>
            <Head title={`Mission ${mission.id}`} />

            {flash.success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {flash.success}
                </div>
            )}

            <Button variant="ghost" className="mb-3 -ml-2 h-auto px-2 text-sm sm:mb-4" asChild>
                <Link href="/personnel/missions">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to my missions
                </Link>
            </Button>

            <div className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:mb-6 sm:gap-3">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">{mission.id}</h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">{mission.title}</p>
                </div>
                <MissionStatusBadge status={mission.status} />
            </div>

            <Card className="mb-4 max-w-3xl shadow-sm sm:mb-6">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                        <div className="min-w-0 flex-1 space-y-3">
                            <h3 className="text-sm font-semibold text-blue-900">Mission brief</h3>
                            <p className="text-sm text-muted-foreground">{mission.brief}</p>
                            {/* --- RESIDENT'S UPLOADED PHOTOS --- */}
                            {mission.images && mission.images.length > 0 && (
                                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                    {mission.images.map((url: string, idx: number) => (
                                        <img 
                                            key={idx} 
                                            src={url} 
                                            alt="Resident Upload" 
                                            className="h-32 w-32 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm"
                                        />
                                    ))}
                                </div>
                            )}
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Concern</dt>
                                    <dd className="font-medium sm:mt-0.5">{mission.concern_id}</dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Location</dt>
                                    <dd className="text-right sm:mt-0.5 sm:text-left">{mission.location}</dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Due date</dt>
                                    <dd className="sm:mt-0.5">{mission.due_date}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Visibility</dt>
                                    <dd className="sm:mt-0.5">
                                        <Badge variant="outline" className="capitalize">
                                            {mission.visibility}
                                        </Badge>
                                    </dd>
                                </div>
                                {mission.reporter_name && (
                                    <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                        <dt className="text-muted-foreground">Reporter</dt>
                                        <dd className="sm:mt-0.5">{mission.reporter_name}</dd>
                                    </div>
                                )}
                                {mission.reporter_phone && (
                                    <div className="flex justify-between gap-2 sm:block">
                                        <dt className="text-muted-foreground">Contact</dt>
                                        <dd className="sm:mt-0.5">
                                            <a
                                                href={`tel:${mission.reporter_phone}`}
                                                className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline"
                                            >
                                                <Phone className="h-3.5 w-3.5" />
                                                {mission.reporter_phone}
                                            </a>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="shrink-0 border-t pt-4 sm:w-44 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                            <h3 className="mb-2 text-sm font-semibold text-blue-900">Status</h3>
                            <CompactMissionStatus steps={timeline} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {mission.visibility === 'private' && (
                <div className="mb-4 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <Shield className="mr-2 inline h-4 w-4" />
                    Private case — do not share details on the public feed.
                </div>
            )}

            {needsProof && (
                <div className="mb-4 flex max-w-3xl items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Submit proof of completion before this mission can be marked done.</span>
                </div>
            )}

            {/* --- NEW PROOF DISPLAY CARD --- */}
            {mission.proof_submitted && (
                <Card className="mb-4 shadow-sm sm:mb-6">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-sm font-semibold text-blue-900">Proof of Completion</h3>
                        <p className="text-sm text-muted-foreground">{mission.proof_notes}</p>
                        
                        {mission.proof_photos && mission.proof_photos.length > 0 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                {mission.proof_photos.map((url: string, idx: number) => (
                                    <img 
                                        key={idx} 
                                        src={url} 
                                        alt={`Proof ${idx + 1}`} 
                                        className="h-32 w-32 shrink-0 rounded-md border border-slate-200 object-cover shadow-sm"
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <Card className="shadow-sm">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-sm font-semibold text-blue-900">Site map</h3>
                        <MapView
                            center={[mission.lat, mission.lng]}
                            pins={[{ id: mission.id, lat: mission.lat, lng: mission.lng, title: mission.title }]}
                            className="h-48 overflow-hidden rounded-lg sm:h-56"
                        />
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-sm font-semibold text-blue-900">Checklist</h3>
                        <MissionChecklist
                            missionId={mission.id}
                            items={mission.checklist}
                            readonly={readonly}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4 flex max-w-3xl flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap">
                {action && (
                    <Button
                        className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto"
                        onClick={() => updateStatus(action.status)}
                    >
                        {action.label}
                    </Button>
                )}
                {needsProof && (
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-2 h-4 w-4" />
                            Submit proof to complete
                        </Link>
                    </Button>
                )}
                {!readonly && mission.status !== 'in_progress' && !mission.proof_submitted && (
                    <Button variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload proof
                        </Link>
                    </Button>
                )}
                {mission.proof_submitted && (
                    <Badge variant="success" className="w-fit px-3 py-1.5">
                        Proof submitted — awaiting verification
                    </Badge>
                )}
            </div>
        </PersonnelLayout>
    );
}
