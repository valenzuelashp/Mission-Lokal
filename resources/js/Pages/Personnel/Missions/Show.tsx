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
    assigned: { label: 'Acknowledge Assignment', status: 'acknowledged' },
    acknowledged: { label: 'Start Field Work', status: 'in_progress' },
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
            label: 'In Progress',
            state: stepState(
                ['completed', 'verified'].includes(mission.status),
                mission.status === 'in_progress',
            ),
        },
        {
            key: 'completed',
            label: 'Completed Work',
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
                <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    {flash.success}
                </div>
            )}

            <div className="mb-4 flex items-center justify-between">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/personnel/missions">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to My Missions
                    </Link>
                </Button>
                <MissionStatusBadge status={mission.status} />
            </div>

            <div className="mb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">{mission.id} · {mission.title}</h2>
            </div>

            {mission.visibility === 'private' && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
                    <Shield className="mr-1.5 inline h-4 w-4 text-amber-600" />
                    🔒 Private confidential case — do not publish or share details externally.
                </div>
            )}

            {needsProof && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span>Mandatory: Please upload photographic proof and execution notes to complete this mission.</span>
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-7">
                    <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                        <CardContent className="p-5 space-y-4">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Mission Operational Brief</h3>
                                <p className="text-sm leading-relaxed text-slate-800 font-medium">{mission.brief}</p>
                            </div>

                            {mission.images && mission.images.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Resident Attached Photos</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {mission.images.map((url: string, idx: number) => (
                                            <img 
                                                key={idx} 
                                                src={url} 
                                                alt="Resident Upload" 
                                                className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 object-cover shadow-2xs"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <dl className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Concern Reference ID</span>
                                    <span className="font-mono font-bold text-slate-900">{mission.concern_id}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Target Deadline</span>
                                    <span className="font-bold text-slate-900">{mission.due_date}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider block">Physical Location</span>
                                    <span className="font-bold text-slate-900 truncate">{mission.location}</span>
                                </div>
                                {mission.reporter_phone && (
                                    <div className="col-span-2 pt-1">
                                        <a href={`tel:${mission.reporter_phone}`} className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                            <Phone className="h-3.5 w-3.5" />
                                            Call Reporter Directly: {mission.reporter_phone}
                                        </a>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>

                    {mission.proof_submitted && (
                        <Card className="border-emerald-200 bg-emerald-50/60 shadow-xs rounded-2xl">
                            <CardContent className="p-5 space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">Submitted Proof of Work</h3>
                                <p className="text-xs text-emerald-800 leading-relaxed font-medium">{mission.proof_notes}</p>
                                
                                {mission.proof_photos && mission.proof_photos.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pt-2">
                                        {mission.proof_photos.map((url: string, idx: number) => (
                                            <img 
                                                key={idx}
                                                src={url}
                                                alt="Proof"
                                                className="h-20 w-20 shrink-0 rounded-xl border border-emerald-200 object-cover shadow-2xs"
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-500">Site Location Map</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <MapView
                                center={[mission.lat, mission.lng]}
                                pins={[{ id: mission.id, lat: mission.lat, lng: mission.lng, title: mission.title, severity: 'medium' }]}
                                className="h-40 rounded-xl overflow-hidden border border-slate-200"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4 lg:col-span-5">
                    <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-500">Execution Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <CompactMissionStatus steps={timeline} />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-xs bg-white rounded-2xl">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-500">Field Checklist Steps</CardTitle>
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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {action && (
                    <Button
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer"
                        onClick={() => updateStatus(action.status)}
                    >
                        {action.label}
                    </Button>
                )}
                {needsProof && (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-2 h-4 w-4" />
                            Submit Execution Proof to Complete
                        </Link>
                    </Button>
                )}
                {!readonly && mission.status !== 'in_progress' && !mission.proof_submitted && (
                    <Button variant="outline" className="w-full sm:w-auto font-bold text-xs py-3 cursor-pointer shadow-2xs" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload Proof Graphics
                        </Link>
                    </Button>
                )}
                {mission.proof_submitted && (
                    <Badge variant="success" className="w-fit px-4 py-2 text-xs font-bold shadow-2xs">
                        ✓ Proof Submitted — Awaiting Administrative Verification
                    </Badge>
                )}
            </div>
        </PersonnelLayout>
    );
}