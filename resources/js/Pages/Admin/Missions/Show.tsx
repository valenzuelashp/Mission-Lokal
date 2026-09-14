import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import StatusTimeline, { TimelineStep } from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ mission }: any) {
    const handleVerify = () => {
        if (confirm('Verify this completed work? This will officially close the mission and mark the parent concern as resolved.')) {
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
        <AdminLayout title={`Mission MS-${mission.id.substring(0, 4).toUpperCase()}`}>
            <Head title={`Mission MS-${mission.id.substring(0, 4).toUpperCase()}`} />
            
            <Button variant="ghost" className="mb-4 cursor-pointer" asChild>
                <Link href="/admin/missions">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mission Queue
                </Link>
            </Button>

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-blue-900">MS-{mission.id.substring(0,4).toUpperCase()}</h2>
                    <p className="text-sm text-muted-foreground">{mission.location}</p>
                </div>
                <Badge variant="outline" className="text-sm capitalize px-3 py-1">{mission.status}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card><CardContent className="p-5">
                        <h3 className="font-semibold text-blue-900 mb-2">Concern Brief</h3>
                        <p className="text-sm text-slate-700">{mission.brief}</p>
                    </CardContent></Card>

                    {mission.proof_photos && mission.proof_photos.length > 0 ? (
                        <Card><CardContent className="p-5">
                            <h3 className="font-semibold text-blue-900 mb-2">Personnel Proof of Work</h3>
                            {mission.proof_notes && <p className="text-sm text-slate-600 mb-3">Notes: {mission.proof_notes}</p>}
                            <div className="flex gap-2 overflow-x-auto">
                                {mission.proof_photos.map((url: string, idx: number) => (
                                    <img key={idx} src={url} alt="Proof" className="h-32 w-32 rounded-lg border object-cover" />
                                ))}
                            </div>
                        </CardContent></Card>
                    ) : (
                        <Card><CardContent className="p-5 text-center py-8">
                            <Clock className="mx-auto h-8 w-8 text-amber-500 mb-2 animate-pulse" />
                            <h3 className="font-semibold text-slate-800">Awaiting Proof of Completion</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                The assigned personnel have not yet submitted proof or marked this mission as completed.
                            </p>
                        </CardContent></Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card><CardContent className="p-5">
                        <h3 className="mb-3 font-semibold text-blue-900">Details</h3>
                        <dl className="text-sm space-y-2">
                            <div className="flex justify-between"><dt className="text-muted-foreground">Personnel(s)</dt><dd className="font-medium">{mission.assignee}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Priority</dt><dd><Badge variant="outline">{mission.priority}</Badge></dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Due Date</dt><dd>{mission.due_date ?? 'Not set'}</dd></div>
                        </dl>
                    </CardContent></Card>

                    <Card><CardContent className="p-5">
                        <h3 className="mb-4 font-semibold text-blue-900">Status Flow</h3>
                        <StatusTimeline steps={timeline} />
                    </CardContent></Card>
                </div>
            </div>

            {/* ONLY APPEARS WHEN MISSION STATUS IS COMPLETED */}
            {mission.status === 'completed' && (
                <div className="mt-6 rounded-lg border bg-emerald-50 border-emerald-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-emerald-900 text-sm">Review & Finalize Work</p>
                        <p className="text-xs text-emerald-700">Personnel has submitted proof of completion. Clicking verify confirms the work and resolves the resident's report.</p>
                    </div>
                    <Button onClick={handleVerify} className="bg-emerald-700 hover:bg-emerald-800 shrink-0 cursor-pointer">
                        <CheckCircle className="mr-2 h-4 w-4" /> Verify Completion & Close
                    </Button>
                </div>
            )}
        </AdminLayout>
    );
}