import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import StatusTimeline, { TimelineStep } from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ mission }: any) {
    const handleVerify = () => {
        if (confirm('Verify this mission? This resolves the parent concern.')) {
            router.post(`/admin/missions/${mission.id}/verify`);
        }
    };

    const timeline: TimelineStep[] = [
        { key: 'assigned', label: 'Assigned', state: 'done', at: mission.assigned_at },
        { key: 'ack', label: 'Acknowledged', state: ['acknowledged', 'in_progress', 'completed', 'verified'].includes(mission.status) ? 'done' : 'upcoming' },
        { key: 'progress', label: 'In progress', state: ['completed', 'verified'].includes(mission.status) ? 'done' : mission.status === 'in_progress' ? 'current' : 'upcoming' },
        { key: 'completed', label: 'Completed', state: ['completed', 'verified'].includes(mission.status) ? 'done' : 'upcoming' },
        { key: 'verified', label: 'Verified', state: mission.status === 'verified' ? 'done' : 'upcoming' },
    ];

    return (
        <AdminLayout title={`Mission ${mission.id.substring(0, 4).toUpperCase()}`}>
            <Head title={`Mission ${mission.id.substring(0, 4).toUpperCase()}`} />
            
            <Button variant="ghost" className="mb-4" asChild>
                <Link href="/admin/missions">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
            </Button>

            <div className="mb-4"><h2 className="text-2xl font-bold">MS-{mission.id.substring(0,4).toUpperCase()}</h2></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card><CardContent className="p-5">
                        <h3 className="font-semibold text-blue-900">Brief</h3>
                        <p className="text-sm text-muted-foreground">{mission.brief}</p>
                    </CardContent></Card>
                </div>

                <div className="space-y-6">
                    <Card><CardContent className="p-5">
                        <h3 className="mb-3 font-semibold text-blue-900">Details</h3>
                        <dl className="text-sm space-y-2">
                            <div className="flex justify-between"><dt className="text-muted-foreground">Assignee</dt><dd>{mission.assignee}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Priority</dt><dd><Badge variant="outline">{mission.priority}</Badge></dd></div>
                        </dl>
                    </CardContent></Card>
                    <Card><CardContent className="p-5">
                        <h3 className="mb-4 font-semibold text-blue-900">Status</h3>
                        <StatusTimeline steps={timeline} />
                    </CardContent></Card>
                </div>
            </div>

            <div className="mt-6">
                {mission.status !== 'verified' && (
                    <Button onClick={handleVerify} className="bg-green-700 hover:bg-green-800">
                        <CheckCircle className="mr-2 h-4 w-4" /> Verify Mission
                    </Button>
                )}
            </div>
        </AdminLayout>
    );
}