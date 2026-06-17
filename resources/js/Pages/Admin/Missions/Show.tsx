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
            <Button variant="ghost" className="mb-3 -ml-2 h-auto px-2 text-sm sm:mb-4" asChild>
                <Link href="/admin/missions">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to mission queue
                </Link>
            </Button>

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold sm:text-2xl">{mission.id}</h2>
                <p className="mt-1 break-words text-sm text-muted-foreground sm:text-base">{mission.concern_title}</p>
            </div>

            <Card className="mb-4 max-w-3xl shadow-sm sm:mb-6">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-3 text-sm font-semibold text-blue-900">Mission details</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Concern</dt>
                                    <dd className="sm:mt-0.5">
                                        <Link href={`/admin/reports/${mission.concern_id}`} className="font-medium text-blue-700">
                                            {mission.concern_id}
                                        </Link>
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Location</dt>
                                    <dd className="text-right sm:mt-0.5 sm:text-left">{mission.location}</dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Assigned to</dt>
                                    <dd className="sm:mt-0.5">{mission.assignee ?? 'Unassigned'}</dd>
                                </div>
                                <div className="flex justify-between gap-2 border-b pb-2 sm:block">
                                    <dt className="text-muted-foreground">Due date</dt>
                                    <dd className="sm:mt-0.5">{mission.due_date}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2 sm:block">
                                    <dt className="text-muted-foreground">Priority</dt>
                                    <dd className="sm:mt-0.5">
                                        <Badge variant="outline">{mission.priority}</Badge>
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="shrink-0 border-t pt-4 sm:w-44 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                            <h3 className="mb-2 text-sm font-semibold text-blue-900">Status</h3>
                            <StatusTimeline steps={timeline} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex max-w-3xl flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto">Reassign personnel</Button>
                <Button variant="outline" className="w-full sm:w-auto">Mark verified</Button>
                <Button variant="outline" className="w-full sm:w-auto">Cancel mission</Button>
            </div>
        </AdminLayout>
    );
}
