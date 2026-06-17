import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import StatusTimeline from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
            <Button variant="ghost" className="mb-4 -ml-2" asChild>
                <Link href="/admin/missions">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to mission queue
                </Link>
            </Button>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold">{mission.id}</h2>
                <p className="mt-1 text-muted-foreground">{mission.concern_title}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Mission details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Concern</span>
                            <Link href={`/admin/reports/${mission.concern_id}`} className="font-medium text-blue-700">
                                {mission.concern_id}
                            </Link>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Location</span>
                            <span>{mission.location}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Assigned to</span>
                            <span>{mission.assignee ?? 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Due date</span>
                            <span>{mission.due_date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority</span>
                            <Badge variant="outline">{mission.priority}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatusTimeline steps={timeline} />
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
                <Button className="bg-blue-700 hover:bg-blue-800">Reassign personnel</Button>
                <Button variant="outline">Mark verified</Button>
                <Button variant="outline">Cancel mission</Button>
            </div>
        </AdminLayout>
    );
}
