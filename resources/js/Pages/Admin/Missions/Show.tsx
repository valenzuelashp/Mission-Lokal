import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, GitMerge, User, Phone } from 'lucide-react';
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
        if (confirm('Verify this completed work? This will officially close the mission and mark the parent concern (along with any merged resident reports) as resolved.')) {
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
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">MS-{mission.id.substring(0,4).toUpperCase()}</h2>
                        {mission.merged_duplicates && mission.merged_duplicates.length > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-xs">
                                <GitMerge className="h-3 w-3 mr-1" /> {mission.merged_duplicates.length + 1} Bundled Reports
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{mission.location}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize font-extrabold px-3 py-1 bg-white">{mission.status}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Concern Operational Brief</h3>
                            <h4 className="text-base font-black text-slate-900 mb-2">{mission.title}</h4>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{mission.brief}</p>
                            
                            {mission.images && mission.images.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Citizen Submitted Evidence</h4>
                                    <div className="flex gap-3 overflow-x-auto pb-1">
                                        {mission.images.map((url: string, idx: number) => (
                                            <img key={idx} src={url} alt="Evidence" className="h-28 w-28 rounded-xl border border-slate-200 object-cover shadow-2xs" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* MERGED RESIDENTS CITIZEN FEEDBACK */}
                    {mission.merged_duplicates && mission.merged_duplicates.length > 0 && (
                        <Card className="shadow-xs border-blue-200 bg-white rounded-2xl">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                                            <GitMerge className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Bundled Citizen Reports ({mission.merged_duplicates.length})
                                        </h3>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-500">All will be notified upon verification</span>
                                </div>

                                <div className="space-y-3">
                                    {mission.merged_duplicates.map((dup: any) => (
                                        <div key={dup.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-900">{dup.title}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{dup.submitted_at}</span>
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3 text-slate-400" />
                                                    {dup.reporter_name || 'Resident'}
                                                </span>
                                                {dup.reporter_mobile && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {dup.reporter_mobile}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 font-medium">
                                                "{dup.description}"
                                            </p>

                                            {dup.images && dup.images.length > 0 && (
                                                <div className="flex gap-2 overflow-x-auto pt-1">
                                                    {dup.images.map((img: string, i: number) => (
                                                        <img key={i} src={img} alt="Resident photo" className="h-14 w-14 rounded-lg object-cover border" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                <div className="flex justify-between border-b pb-2"><dt className="text-muted-foreground">Target Deadline</dt><dd className="font-bold">{mission.due_date ?? 'Not set'}</dd></div>
                                {mission.merged_duplicates && (
                                    <div className="flex justify-between"><dt className="text-muted-foreground">Combined Resident Reports</dt><dd className="font-black text-blue-700">{mission.merged_duplicates.length + 1} Reports</dd></div>
                                )}
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
                        <p className="text-xs text-emerald-700 mt-0.5">Personnel has submitted work proof. Verifying this task will automatically close the mission and mark the parent concern (plus all merged resident reports) as resolved.</p>
                    </div>
                    <Button onClick={handleVerify} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-sm">
                        <CheckCircle className="mr-2 h-4 w-4" /> Verify Completion & Close Report
                    </Button>
                </div>
            )}
        </AdminLayout>
    );
}