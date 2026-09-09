import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Camera, CircleAlert, Phone, Shield } from 'lucide-react';
import CompactMissionStatus from '@/Components/personnel/CompactMissionStatus';
import MissionChecklist from '@/Components/personnel/MissionChecklist';
import MissionStatusBadge from '@/Components/personnel/MissionStatusBadge';
import MapView from '@/Components/maps/MapView';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
    assigned: { label: 'Acknowledge assignment', status: 'acknowledged' },
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
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {flash.success}
                </div>
            )}

            {/* Top Navigation & Header */}
            <div className="mb-3 flex items-center justify-between">
                <Button variant="ghost" className="-ml-2 h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/personnel/missions">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to my missions
                    </Link>
                </Button>
                <MissionStatusBadge status={mission.status} />
            </div>

            <div className="mb-3">
                <h2 className="text-lg font-bold text-blue-900 sm:text-xl">{mission.id} · {mission.title}</h2>
            </div>

            {/* Banners */}
            {mission.visibility === 'private' && (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <Shield className="mr-1.5 inline h-3.5 w-3.5" />
                    Private case — do not share details on the public feed.
                </div>
            )}

            {needsProof && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>Submit proof of completion before this mission can be marked done.</span>
                </div>
            )}

            {/* Compact 2-Column Dashboard Grid */}
            <div className="grid gap-3 lg:grid-cols-12">
                
                {/* LEFT COLUMN: Brief, Photos, Details & Map (7 Cols) */}
                <div className="space-y-3 lg:col-span-7">
                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardContent className="p-4 space-y-3">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Mission Brief</h3>
                                <p className="text-sm leading-relaxed text-slate-700">{mission.brief}</p>
                            </div>

                            {/* Resident Uploaded Photos */}
                            {mission.images && mission.images.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Attached Photos</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {mission.images.map((url: string, idx: number) => (
                                            <img 
                                                key={idx} 
                                                src={url} 
                                                alt="Resident Upload" 
                                                className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover shadow-2xs"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Metadata Grid */}
                            <dl className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                                <div>
                                    <span className="text-muted-foreground block">Concern ID:</span>
                                    <span className="font-medium text-slate-900">{mission.concern_id}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Due Date:</span>
                                    <span className="font-medium text-slate-900">{mission.due_date}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block">Location:</span>
                                    <span className="font-medium text-slate-900 truncate">{mission.location}</span>
                                </div>
                                {mission.reporter_phone && (
                                    <div className="col-span-2 pt-1">
                                        <a href={`tel:${mission.reporter_phone}`} className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline">
                                            <Phone className="h-3 w-3" />
                                            Call Reporter: {mission.reporter_phone}
                                        </a>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Proof Display Card (If submitted) */}
                    {mission.proof_submitted && (
                        <Card className="border-emerald-200 bg-emerald-50/60 shadow-2xs">
                            <CardContent className="p-4 space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Proof of Completion</h3>
                                <p className="text-xs text-emerald-800 leading-relaxed">{mission.proof_notes}</p>
                                
                                {mission.proof_photos && mission.proof_photos.length > 0 && (
                                    <div className="flex gap-1.5 overflow-x-auto pt-1">
                                        {mission.proof_photos.map((url: string, idx: number) => (
                                            <img 
                                                key={idx} 
                                                src={url} 
                                                alt={`Proof ${idx + 1}`} 
                                                className="h-20 w-20 shrink-0 rounded border border-emerald-200 object-cover"
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Mini Map */}
                    <Card className="border-slate-200/80 shadow-2xs overflow-hidden">
                        <CardHeader className="py-2.5 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Location</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <MapView
                                center={[mission.lat, mission.lng]}
                                pins={[{ id: mission.id, lat: mission.lat, lng: mission.lng, title: mission.title, severity: 'medium' }]}
                                className="h-36 rounded-md"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Status Timeline & Checklist (5 Cols) */}
                <div className="space-y-3 lg:col-span-5">
                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <CompactMissionStatus steps={timeline} />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <MissionChecklist
                                missionId={mission.id}
                                items={mission.checklist}
                                readonly={readonly}
                            />
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Bottom Action Bar */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {action && (
                    <Button
                        className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto text-xs h-9"
                        onClick={() => updateStatus(action.status)}
                    >
                        {action.label}
                    </Button>
                )}
                {needsProof && (
                    <Button className="w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto text-xs h-9" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-1.5 h-3.5 w-3.5" />
                            Submit proof to complete
                        </Link>
                    </Button>
                )}
                {!readonly && mission.status !== 'in_progress' && !mission.proof_submitted && (
                    <Button variant="outline" className="w-full sm:w-auto text-xs h-9" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-1.5 h-3.5 w-3.5" />
                            Upload proof
                        </Link>
                    </Button>
                )}
                {mission.proof_submitted && (
                    <Badge variant="success" className="w-fit px-3 py-1.5 text-xs">
                        Proof submitted — awaiting verification
                    </Badge>
                )}
            </div>
        </PersonnelLayout>
    );
}