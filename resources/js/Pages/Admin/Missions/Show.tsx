import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import StatusTimeline, { TimelineStep } from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps } from '@/Types';

export default function Show({ mission }: any) {
    const { auth } = usePage<PageProps & { auth: { user: any } }>().props;
    const canModify = auth.user?.can_modify_system ?? true;

    const handleVerify = () => {
        if (confirm('Verify this completed work? This will officially close the mission and mark the parent concern as resolved.')) {
            router.post(`/admin/missions/${mission.id}/verify`);
        }
    };

    const timeline: TimelineStep[] = [
        { key: 'assigned', label: 'Assigned', state: 'done', at: mission.assigned_at },
        { key: 'ack', label: 'Acknowledged', state: ['acknowledged', 'in_progress', 'completed', 'verified'].includes(mission.status) ? 'done' : 'upcoming' },
        { key: 'progress', label: 'In Progress', state: ['completed', 'verified'].includes(mission.status) ? 'done' : mission.status === 'in_progress' ? 'current' : 'upcoming' },
        { key: 'completed', label: 'Completed Work', state: ['completed', 'verified'].includes(mission.status) ? 'done' : 'upcoming' },
        { key: 'verified', label: 'Verified & Closed', state: mission.status === 'verified' ? 'done' : 'upcoming' },
    ];

    return (
        <AdminLayout title={`Mission MS-${mission.id.substring(0, 4).toUpperCase()}`}>
            <Head title={`Mission MS-${mission.id.substring(0, 4).toUpperCase()}`} />
            
            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/missions">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mission Queue
                    </Link>
                </Button>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">MS-{mission.id.substring(0,4).toUpperCase()}</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{mission.location}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize font-extrabold px-3 py-1 bg-white">{mission.status}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Concern Operational Brief</h3>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium">{mission.brief}</p>
                        </CardContent>
                    </Card>

                    {mission.proof_photos && mission.proof_photos.length > 0 ? (
                        <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                            <CardContent className="p-6">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Personnel Proof of Work</h3>
                                {mission.proof_notes && <p className="text-xs text-slate-700 mb-3 font-medium bg-slate-50 p-3 rounded-xl border">Notes: {mission.proof_notes}</p>}
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                    {mission.proof_photos.map((url: string, idx: number) => (
                                        <img key={idx} src={url} alt="Proof" className="h-36 w-36 rounded-xl border border-slate-200 object-cover shadow-2xs" />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                            <CardContent className="p-6 text-center py-10">
                                <Clock className="mx-auto h-8 w-8 text-amber-500 mb-2 animate-pulse" />
                                <h3 className="font-bold text-slate-800 text-sm">Awaiting Proof of Completion</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Assigned field personnel have not yet submitted execution proof or marked this task as completed.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">Mission Metadata</h3>
                            <dl className="text-xs space-y-3 font-medium">
                                <div className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">Assigned Unit(s)</dt><dd className="font-bold text-slate-900">{mission.assignee}</dd></div>
                                <div className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">Priority Tier</dt><dd><Badge variant="outline" className="font-bold">{mission.priority}</Badge></dd></div>
                                <div className="flex justify-between"><dt className="text-muted-foreground">Target Deadline</dt><dd className="font-bold">{mission.due_date ?? 'Not set'}</dd></div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Operational Status Flow</h3>
                            <StatusTimeline steps={timeline} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {mission.status === 'completed' && canModify && (
                <div className="mt-6 rounded-2xl border bg-emerald-50 border-emerald-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <p className="font-black text-emerald-900 text-sm">Review & Finalize Field Work</p>
                        <p className="text-xs text-emerald-700 mt-0.5">Personnel has submitted work proof. Verifying this task will automatically close the mission and mark the parent concern as resolved.</p>
                    </div>
                    <Button onClick={handleVerify} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm">
                        <CheckCircle className="mr-2 h-4 w-4" /> Verify Completion & Close Report
                    </Button>
                </div>
            )}
        </AdminLayout>
    );
}