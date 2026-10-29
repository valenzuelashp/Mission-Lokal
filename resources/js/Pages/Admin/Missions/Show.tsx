import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, GitMerge, User, Phone, MapPin, ShieldCheck, Sparkles, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatusTimeline, { TimelineStep } from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PageProps } from '@/Types';

export default function Show({ mission }: any) {
    const { auth } = usePage<PageProps & { auth: { user: any } }>().props;
    const canModify = auth.user?.can_modify_system ?? true;
    const [resolutionComposerOpen, setResolutionComposerOpen] = useState(false);
    const [resendingPersonnelId, setResendingPersonnelId] = useState<string | null>(null);
    const [personnelCategoryFilter, setPersonnelCategoryFilter] = useState('all');
    const availablePersonnel = mission.available_personnel ?? [];
    const personnelCategories = [...new Set(availablePersonnel.map((personnel: { category: string }) => personnel.category))]
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right));
    const filteredPersonnel = personnelCategoryFilter === 'all'
        ? availablePersonnel
        : availablePersonnel.filter((personnel: { category: string }) => personnel.category === personnelCategoryFilter);
    const { data, setData, post, processing, errors } = useForm({
        title: mission.resolution_post?.title ?? '',
        body: mission.resolution_post?.body ?? '',
        media_ids: mission.resolution_post?.media_ids ?? [] as string[],
    });
    const {
        data: personnelData,
        setData: setPersonnelData,
        post: postPersonnel,
        processing: addingPersonnel,
        errors: personnelErrors,
        reset: resetPersonnel,
    } = useForm({ personnel_ids: [] as string[] });

    useEffect(() => {
        if (mission.resolution_post?.id) {
            setData({
                title: mission.resolution_post.title,
                body: mission.resolution_post.body,
                media_ids: mission.resolution_post.media_ids ?? [],
            });
            setResolutionComposerOpen(true);
        }
    }, [mission.resolution_post?.id]);

    const handleVerify = () => {
        if (confirm('Verify this completed work? This will officially close the mission and mark the parent concern (along with any merged resident reports) as resolved.')) {
            router.post(`/admin/missions/${mission.id}/verify`);
        }
    };

    const handleResendSms = (personnelId: string) => {
        router.post(`/admin/missions/${mission.id}/personnel/${personnelId}/resend-sms`, {}, {
            preserveScroll: true,
            onStart: () => setResendingPersonnelId(personnelId),
            onFinish: () => setResendingPersonnelId(null),
        });
    };

    const togglePersonnelSelection = (personnelId: string) => {
        const currentIds = personnelData.personnel_ids;
        setPersonnelData('personnel_ids', currentIds.includes(personnelId)
            ? currentIds.filter((id) => id !== personnelId)
            : [...currentIds, personnelId]);
    };

    const handleAddPersonnel = (event: React.FormEvent) => {
        event.preventDefault();
        postPersonnel(`/admin/missions/${mission.id}/personnel`, {
            preserveScroll: true,
            onSuccess: () => resetPersonnel(),
        });
    };

    const toggleResolutionImage = (mediaId: string) => {
        const selectedIds = data.media_ids.includes(mediaId)
            ? data.media_ids.filter((id: string) => id !== mediaId)
            : [...data.media_ids, mediaId];
        setData('media_ids', selectedIds);
    };

    const handlePublishResolution = (event: React.FormEvent) => {
        event.preventDefault();
        post(`/admin/missions/${mission.id}/resolution-post`, {
            onSuccess: () => setResolutionComposerOpen(false),
        });
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
            
            <div className="w-full space-y-8 pb-16">
                
                {/* Immersive Top Command Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                            <Link href="/admin/missions" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Queue
                            </Link>
                        </Button>
                        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Mission Ref:</span>
                            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                MS-{mission.id.substring(0, 4).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-xs font-black px-3.5 py-1.5 bg-blue-50/70 border-blue-200 text-blue-800 shadow-2xs uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            Status: {mission.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-black px-3.5 py-1.5 bg-slate-900 border-slate-900 text-white shadow-2xs uppercase tracking-wider">
                            {mission.priority ?? 'Medium'} Priority
                        </Badge>
                    </div>
                </div>

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Sparkles className="h-3 w-3" /> Field Operation Monitoring
                            </span>
                            {mission.merged_duplicates && mission.merged_duplicates.length > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-xs">
                                    <GitMerge className="h-3 w-3 mr-1" /> {mission.merged_duplicates.length + 1} Bundled Reports
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            {mission.title}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                        <span>{mission.location}</span>
                    </div>
                </div>

                {/* Main Asymmetric Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Brief, Evidence, Merged Reports, and Proof of Work */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Operational Brief Card */}
                        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                            <CardContent className="p-6 sm:p-8 space-y-5">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Concern Operational Brief</h3>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                                    {mission.brief}
                                </p>
                                
                                {mission.images && mission.images.length > 0 && (
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Citizen Submitted Evidence</h4>
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {mission.images.map((url: string, idx: number) => (
                                                <img key={idx} src={url} alt="Evidence" className="h-28 w-28 rounded-2xl border border-slate-200 object-cover shadow-2xs" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Merged Resident Reports */}
                        {mission.merged_duplicates && mission.merged_duplicates.length > 0 && (
                            <Card className="shadow-2xs border-blue-200/80 bg-white rounded-3xl">
                                <CardContent className="p-6 sm:p-8 space-y-5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                                                <GitMerge className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900">
                                                    Bundled Citizen Reports ({mission.merged_duplicates.length})
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium">All linked residents will be notified upon verification</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {mission.merged_duplicates.map((dup: any) => (
                                            <div key={dup.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-black text-slate-900">{dup.title}</span>
                                                    <span className="text-[11px] text-slate-400 font-semibold">{dup.submitted_at}</span>
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                                                    <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        {dup.reporter_name || 'Resident'}
                                                    </span>
                                                    {dup.reporter_mobile && (
                                                        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            {dup.reporter_mobile}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/80 font-medium">
                                                    "{dup.description}"
                                                </p>

                                                {dup.images && dup.images.length > 0 && (
                                                    <div className="flex gap-2 overflow-x-auto pt-1">
                                                        {dup.images.map((img: string, i: number) => (
                                                            <img key={i} src={img} alt="Resident photo" className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-2xs" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Personnel Proof of Work */}
                        {mission.proof_photos && mission.proof_photos.length > 0 ? (
                            <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                                <CardContent className="p-6 sm:p-8 space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Personnel Proof of Work</h3>
                                    {mission.proof_notes && <p className="text-xs text-slate-700 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100"><strong>Notes:</strong> {mission.proof_notes}</p>}
                                    {mission.proof_latitude !== null && mission.proof_latitude !== undefined && (
                                        <p className="text-xs text-slate-600 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block">
                                            <strong>GPS Telemetry:</strong> {mission.proof_latitude}, {mission.proof_longitude}
                                            {mission.proof_location_accuracy_m ? ` (±${Math.round(mission.proof_location_accuracy_m)} m)` : ''}
                                        </p>
                                    )}
                                    <div className="flex gap-3 overflow-x-auto pb-1 pt-2">
                                        {mission.proof_photos.map((url: string, idx: number) => (
                                            <img key={idx} src={url} alt="Proof" className="h-36 w-36 rounded-2xl border border-slate-200 object-cover shadow-2xs" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                                <CardContent className="p-8 text-center py-12 space-y-3">
                                    <Clock className="mx-auto h-10 w-10 text-amber-500 animate-pulse" />
                                    <h3 className="font-bold text-slate-800 text-sm">Awaiting Proof of Completion</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                        Assigned field personnel have not yet submitted execution proof or marked this task as completed.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Metadata, Status Timeline & Verification Actions */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Metadata Card */}
                        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                            <CardContent className="p-6 sm:p-8 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Mission Metadata</h3>
                                <dl className="text-xs space-y-3.5 font-medium">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <dt className="text-muted-foreground">Assigned Unit(s)</dt>
                                        <dd className="font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg">{mission.assignee}</dd>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <dt className="text-muted-foreground">Priority Tier</dt>
                                        <dd><Badge variant="outline" className="font-bold">{mission.priority}</Badge></dd>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                        <dt className="text-muted-foreground">Target Deadline</dt>
                                        <dd className="font-bold text-slate-900">{mission.due_date ?? 'Not set'}</dd>
                                    </div>
                                    {mission.merged_duplicates && (
                                        <div className="flex justify-between items-center pt-1">
                                            <dt className="text-muted-foreground">Combined Resident Reports</dt>
                                            <dd className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{mission.merged_duplicates.length + 1} Reports</dd>
                                        </div>
                                    )}
                                </dl>
                                {canModify && !['completed', 'verified', 'cancelled'].includes(mission.status) && (
                                    <form onSubmit={handleAddPersonnel} className="space-y-3 border-t border-slate-100 pt-4">
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Add Personnel</h4>
                                            <p className="mt-1 text-[11px] text-slate-500">Newly added personnel keep current assignees and receive an SMS notification.</p>
                                        </div>
                                        {availablePersonnel.length === 0 ? (
                                            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">No additional active personnel available.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                        {personnelData.personnel_ids.length} selected
                                                    </span>
                                                    <select
                                                        aria-label="Filter personnel by field"
                                                        value={personnelCategoryFilter}
                                                        onChange={(event) => setPersonnelCategoryFilter(event.target.value)}
                                                        className="h-8 max-w-40 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700"
                                                    >
                                                        <option value="all">All fields</option>
                                                        {personnelCategories.map((category: string) => (
                                                            <option key={category} value={category}>{category}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-2">
                                                    {filteredPersonnel.length === 0 ? (
                                                        <p className="px-2 py-4 text-center text-xs text-slate-500">No additional personnel in this field.</p>
                                                    ) : filteredPersonnel.map((personnel: { id: string; name: string; category: string }) => (
                                                        <label key={personnel.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-xs text-slate-800 hover:bg-blue-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={personnelData.personnel_ids.includes(personnel.id)}
                                                                onChange={() => togglePersonnelSelection(personnel.id)}
                                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="min-w-0 flex-1 truncate font-semibold">{personnel.name}</span>
                                                            <span className="shrink-0 text-[11px] text-slate-500">{personnel.category}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {personnelErrors.personnel_ids && <p className="text-xs font-semibold text-red-600">{personnelErrors.personnel_ids}</p>}
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={addingPersonnel || personnelData.personnel_ids.length === 0}
                                            className="h-9 text-xs font-bold"
                                        >
                                            {addingPersonnel ? 'Adding...' : 'Add Selected Personnel'}
                                        </Button>
                                    </form>
                                )}
                                <div className="space-y-3 border-t border-slate-100 pt-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Personnel SMS</h4>
                                    {(mission.assigned_personnel ?? []).length === 0 ? (
                                        <p className="text-xs text-slate-500">No personnel are assigned to this mission.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {mission.assigned_personnel.map((personnel: { id: string; name: string; sms_enabled: boolean; has_mobile: boolean }) => {
                                                const disabledReason = !personnel.sms_enabled
                                                    ? 'SMS disabled'
                                                    : !personnel.has_mobile
                                                        ? 'No mobile number'
                                                        : null;

                                                return (
                                                    <div key={personnel.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800">{personnel.name || 'Personnel'}</p>
                                                            {disabledReason && <p className="mt-0.5 text-[11px] text-amber-700">{disabledReason}</p>}
                                                        </div>
                                                        {canModify && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={Boolean(disabledReason) || resendingPersonnelId === personnel.id}
                                                                onClick={() => handleResendSms(personnel.id)}
                                                                className="h-8 gap-1.5 text-xs font-bold"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                                {resendingPersonnelId === personnel.id ? 'Sending...' : 'Resend SMS'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Operational Status Flow Card */}
                        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl">
                            <CardContent className="p-6 sm:p-8 space-y-5">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Operational Status Flow</h3>
                                <div className="pt-2">
                                    <StatusTimeline steps={timeline} />
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* Verification Box at Bottom */}
                {mission.status === 'completed' && canModify && (
                    <div className="rounded-3xl border bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
                        <div className="space-y-1">
                            <h4 className="font-black text-emerald-950 text-base flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Review & Finalize Field Work
                            </h4>
                            <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl font-medium">
                                Personnel has submitted work proof. Verifying this task will automatically close the mission and mark the parent concern (plus all merged resident reports) as resolved.
                            </p>
                        </div>
                        <Button onClick={handleVerify} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-5 shrink-0 cursor-pointer shadow-sm rounded-2xl">
                            <CheckCircle className="mr-2 h-4 w-4" /> Verify Completion & Close Report
                        </Button>
                    </div>
                )}

                {mission.resolution_post && canModify && !resolutionComposerOpen && (
                    <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/80 p-5 shadow-2xs">
                        <p className="text-xs font-semibold text-blue-950">The verified resolution update is ready for publication on the public feed.</p>
                        <Button onClick={() => setResolutionComposerOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold rounded-xl h-10 px-4">
                            Review Public Update
                        </Button>
                    </div>
                )}
            </div>

            {/* Resolution Composer Modal */}
            {resolutionComposerOpen && mission.resolution_post && canModify && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-xs">
                    <form onSubmit={handlePublishResolution} className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
                            <div>
                                <h2 className="text-base font-black text-slate-900">Publish Verified Resolution</h2>
                                <p className="mt-0.5 text-xs text-slate-500">Review the personnel summary and proof photos before posting to the public feed.</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => setResolutionComposerOpen(false)} className="text-xs font-bold rounded-xl">Not now</Button>
                        </div>
                        <div className="space-y-5 p-6 sm:p-8">
                            <div className="space-y-1.5">
                                <label htmlFor="resolution-title" className="block text-xs font-black uppercase tracking-wider text-slate-700">Post title</label>
                                <Input id="resolution-title" value={data.title} onChange={(event) => setData('title', event.target.value)} maxLength={255} required className="rounded-xl h-11 text-xs" />
                                {errors.title && <p className="text-xs font-semibold text-red-600">{errors.title}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="resolution-body" className="block text-xs font-black uppercase tracking-wider text-slate-700">Public accomplishment report</label>
                                <Textarea id="resolution-body" value={data.body} onChange={(event) => setData('body', event.target.value)} rows={8} maxLength={5000} required className="rounded-2xl text-xs p-4" />
                                {errors.body && <p className="text-xs font-semibold text-red-600">{errors.body}</p>}
                            </div>
                            <fieldset className="space-y-3">
                                <legend className="text-xs font-black uppercase tracking-wider text-slate-700">Completion proof photos</legend>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {(mission.resolution_post.images ?? []).map((image: { id: string; url: string }) => (
                                        <label key={image.id} className="cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 block transition-all hover:border-blue-300">
                                            <img src={image.url} alt="Mission completion proof" className="aspect-[4/3] w-full object-cover" />
                                            <span className="flex items-center gap-2 p-2.5 text-xs font-bold text-slate-700 bg-white">
                                                <input type="checkbox" checked={data.media_ids.includes(image.id)} onChange={() => toggleResolutionImage(image.id)} className="rounded border-slate-300 text-blue-600" />
                                                Include in post
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.media_ids && <p className="text-xs font-semibold text-red-600">{errors.media_ids}</p>}
                            </fieldset>
                        </div>
                        <div className="sticky bottom-0 flex justify-end gap-2.5 border-t border-slate-100 bg-white px-6 py-5">
                            <Button type="button" variant="outline" onClick={() => setResolutionComposerOpen(false)} className="text-xs font-bold rounded-xl h-10">Save for later</Button>
                            <Button type="submit" disabled={processing || data.media_ids.length === 0} className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 rounded-xl h-10 px-5 shadow-sm">
                                {processing ? 'Publishing...' : 'Publish to Community Feed'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </AdminLayout>
    );
}