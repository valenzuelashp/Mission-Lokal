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
    assigned: { label: 'Acknowledge dispatch', status: 'acknowledged' },
    acknowledged: { label: 'Initiate operational route', status: 'in_progress' },
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
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md px-3.5 py-3 text-xs font-bold text-neutral-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-neutral-900" />
                    <span className="truncate">{flash.success}</span>
                </div>
            )}

            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-transparent" asChild>
                <Link href="/personnel/missions">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                    Back to hub
                </Link>
            </Button>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/40 pb-4">
                <div className="min-w-0">
                    <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 sm:text-2xl">{mission.id}</h2>
                    <p className="mt-1 text-sm font-bold tracking-tight text-neutral-500 sm:text-base leading-snug">{mission.title}</p>
                </div>
                <MissionStatusBadge status={mission.status} />
            </div>

            <Card className="mb-5 max-w-4xl border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:gap-8">
                        <div className="min-w-0 flex-1 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Mission brief</h3>
                            <p className="text-xs font-medium text-neutral-600 leading-relaxed bg-neutral-50/40 border border-neutral-200/40 p-3 rounded-xl">{mission.brief}</p>
                            
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-xs font-bold sm:grid-cols-2 pt-1">
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Reference File</dt>
                                    <dd className="text-neutral-800 sm:mt-1 font-black">{mission.concern_id}</dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Target Geolocation</dt>
                                    <dd className="text-right text-neutral-600 font-medium sm:mt-1 sm:text-left leading-tight">{mission.location}</dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Expiration Milestone</dt>
                                    <dd className="text-neutral-800 sm:mt-1 tabular-nums">{mission.due_date}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Feed Visibility</dt>
                                    <dd className="sm:mt-1">
                                        <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider bg-white text-neutral-500 border-neutral-200">
                                            {mission.visibility}
                                        </Badge>
                                    </dd>
                                </div>
                                {mission.reporter_name && (
                                    <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                        <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Filing Reporter</dt>
                                        <dd className="text-neutral-800 sm:mt-1 font-semibold">{mission.reporter_name}</dd>
                                    </div>
                                )}
                                {mission.reporter_phone && (
                                    <div className="flex justify-between gap-2 sm:block">
                                        <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Contact Stream</dt>
                                        <dd className="sm:mt-1">
                                            <a
                                                href={`tel:${mission.reporter_phone}`}
                                                className="inline-flex items-center gap-1 font-black text-neutral-900 border-b border-neutral-900/40 pb-0.5 hover:border-neutral-900 transition-colors"
                                            >
                                                <Phone className="h-3 w-3 stroke-[2.5]" />
                                                <span className="tabular-nums">{mission.reporter_phone}</span>
                                            </a>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        <div className="shrink-0 border-t border-neutral-200/60 pt-4 lg:w-48 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-neutral-400">Ledger Status</h3>
                            <CompactMissionStatus steps={timeline} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {mission.visibility === 'private' && (
                <div className="mb-4 max-w-4xl rounded-xl border border-neutral-200 bg-white/90 backdrop-blur-md px-4 py-3 text-xs font-bold text-neutral-800 shadow-xs flex items-center gap-2">
                    <Shield className="h-4 w-4 shrink-0 text-neutral-900" />
                    <span>Protected Case Ledger — dynamic encryption standards apply. Do not duplicate onto local tracking instances.</span>
                </div>
            )}

            {needsProof && (
                <div className="mb-4 max-w-4xl rounded-xl border border-neutral-200/60 bg-white/90 backdrop-blur-md px-4 py-3 text-xs font-bold text-neutral-900 shadow-xs flex items-center gap-2">
                    <CircleAlert className="h-4 w-4 shrink-0 text-neutral-900 animate-pulse" />
                    <span>Resolution Interlock: Media packet arrays must be signed off on form upload prior to state graduation.</span>
                </div>
            )}

            {mission.proof_submitted && (
                <Card className="mb-5 max-w-4xl border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Captured Proof Manifest</h3>
                        <p className="text-xs font-semibold text-neutral-700 leading-relaxed bg-neutral-50/50 border border-neutral-200/40 p-3 rounded-xl">{mission.proof_notes}</p>
                        
                        {mission.proof_photos && mission.proof_photos.length > 0 && (
                            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1.5 mask-image">
                                {mission.proof_photos.map((url: string, idx: number) => (
                                    <img 
                                        key={idx} 
                                        src={url} 
                                        alt={`Telemetry Manifest ${idx + 1}`} 
                                        className="h-28 w-28 shrink-0 rounded-xl border border-neutral-200/80 object-cover shadow-xs hover:border-neutral-400 transition-all cursor-zoom-in"
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-5 max-w-4xl lg:grid-cols-2">
                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Cartographic Overlay</h3>
                        <MapView
                            center={[mission.lat, mission.lng]}
                            pins={[{ id: mission.id, lat: mission.lat, lng: mission.lng, title: mission.title }]}
                            className="h-48 overflow-hidden rounded-xl border border-neutral-200 shadow-inner sm:h-56"
                        />
                    </CardContent>
                </Card>

                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Operational Checklist</h3>
                        <MissionChecklist
                            missionId={mission.id}
                            items={mission.checklist}
                            readonly={readonly}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Action Row Elements */}
            <div className="mt-5 flex max-w-4xl flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                {action && (
                    <Button
                        className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5"
                        onClick={() => updateStatus(action.status)}
                    >
                        {action.label}
                    </Button>
                )}
                {needsProof && (
                    <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-2 h-4 w-4 stroke-[2.5]" />
                            Launch closure interface
                        </Link>
                    </Button>
                )}
                {!readonly && mission.status !== 'in_progress' && !mission.proof_submitted && (
                    <Button variant="outline" className="w-full border-neutral-200 bg-white/80 hover:bg-white text-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm sm:w-auto px-5" asChild>
                        <Link href={`/personnel/missions/${mission.id}/proof`}>
                            <Camera className="mr-2 h-4 w-4 text-neutral-500" />
                            Upload evidence arrays
                        </Link>
                    </Button>
                )}
                {mission.proof_submitted && (
                    <Badge variant="outline" className="w-fit rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-500 shadow-xs">
                        Staged for verification log verification
                    </Badge>
                )}
            </div>
        </PersonnelLayout>
    );
}