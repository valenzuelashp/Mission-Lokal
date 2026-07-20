import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import StatusTimeline from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoMissions } from '@/Lib/adminDemo';

type Props = {
    missionId?: string;
};

type TimelineState = 'done' | 'current' | 'upcoming';

function stepState(done: boolean, current = false): TimelineState {
    if (done) return 'done';
    if (current) return 'current';
    return 'upcoming';
}

export default function Show({ missionId }: Props) {
    const mission = demoMissions.find((m) => m.id.replace('#', '') === missionId || m.id === missionId)
        ?? demoMissions[0];

    const timeline = [
        { key: 'assigned', label: 'Assigned', at: 'Jun 17, 8:00 AM', state: 'done' as TimelineState },
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
        {
            key: 'verified',
            label: 'Verified',
            state: stepState(mission.status === 'verified'),
        },
    ];

    return (
        <AdminLayout title="Mission-Lokal Admin: Mission Detail">
            <Head title={`Mission ${mission.id}`} />
            
            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-transparent" asChild>
                <Link href="/admin/missions">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 mercantile-back-arrow stroke-[2.5]" />
                    Back to mission queue
                </Link>
            </Button>

            <div className="mb-5 flex flex-col gap-1 border-b border-neutral-200/40 pb-4">
                <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900 sm:text-2xl">{mission.id}</h2>
                <p className="mt-1 break-words text-sm font-bold tracking-tight text-neutral-500 leading-snug">{mission.concern_title}</p>
            </div>

            <Card className="mb-5 max-w-4xl border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                        <div className="min-w-0 flex-1 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Mission Parameters</h3>
                            
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-xs font-bold sm:grid-cols-2 pt-1">
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Target Concern Link</dt>
                                    <dd className="sm:mt-1 font-black">
                                        <Link href={`/admin/reports/${mission.concern_id}`} className="inline-block border-b border-neutral-900/40 text-neutral-900 hover:border-neutral-900 transition-colors">
                                            {mission.concern_id}
                                        </Link>
                                    </dd>
                                </div>
                                
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Deployment Location</dt>
                                    <dd className="text-right text-neutral-600 font-medium sm:mt-1 sm:text-left leading-tight">{mission.location}</dd>
                                </div>
                                
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Assigned Node</dt>
                                    <dd className="text-neutral-900 sm:mt-1 font-black">
                                        {mission.assignee ? (
                                            <span>{mission.assignee}</span>
                                        ) : (
                                            <span className="text-neutral-400 uppercase text-[9px] tracking-widest bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-md">Unassigned Node</span>
                                        )}
                                    </dd>
                                </div>
                                
                                <div className="flex justify-between gap-2 border-b border-neutral-100 pb-2 sm:block sm:border-0 sm:pb-0">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Milestone Expiration</dt>
                                    <dd className="text-neutral-800 sm:mt-1 tabular-nums font-medium">{mission.due_date}</dd>
                                </div>
                                
                                <div className="flex items-center justify-between gap-2 sm:block">
                                    <dt className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Criticality Index</dt>
                                    <dd className="sm:mt-1">
                                        <Badge variant="outline" className={`rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider border-neutral-200 text-neutral-500 bg-neutral-50 ${
                                            mission.priority === 'high' ? 'border-neutral-900 bg-neutral-900 text-white' : ''
                                        }`}>
                                            {mission.priority} priority
                                        </Badge>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="shrink-0 border-t border-neutral-200/60 pt-4 sm:w-44 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-neutral-400">Ledger Timeline</h3>
                            <div className="transform scale-95 origin-top-left custom-timeline-wrapper">
                                <StatusTimeline steps={timeline} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex max-w-4xl flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5">
                    Reassign personnel
                </Button>
                <Button variant="outline" className="w-full border-neutral-200 bg-white/80 hover:bg-white text-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm sm:w-auto px-5">
                    Mark verified
                </Button>
                <Button variant="outline" className="w-full border-transparent hover:bg-neutral-50 rounded-xl font-black uppercase tracking-widest text-xs h-10 text-neutral-400 hover:text-neutral-900 sm:w-auto px-5 transition-colors">
                    Cancel mission
                </Button>
            </div>
        </AdminLayout>
    );
}