import { useState, useTransition } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Zap, MapPin, ShieldAlert, GitMerge, User, Phone, Calendar, Sparkles, Clock } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import MapView from '@/Components/maps/MapView';
import { Badge } from '@/Components/ui/badge';
import { TAMBO_CENTER } from '@/Lib/mapUtils';
import { cn } from '@/Lib/utils';

function formatStep(step: unknown): string {
    if (typeof step === 'string') return step;
    if (step && typeof step === 'object') {
        const value = step as Record<string, unknown>;
        const text = value.step ?? value.title ?? value.instruction ?? value.action;
        if (typeof text === 'string') return text;
    }
    return JSON.stringify(step);
}

interface Props {
    report: any;
    masterCandidates?: { id: string; label: string }[];
    personnel?: { id: string; name: string; category: string; subcategories: string[] }[];
}

export default function Show({ report, personnel = [] }: Props) {
    const [overrideAction, setOverrideAction] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const { data, setData, post, processing, errors } = useForm({
        concern_id: report?.id ?? '',
        personnel_ids: report?.assigned_personnel_ids ?? [] as string[],
        confirmed_action: report?.ai_recommended_action ?? 'escalate',
        rejection_reason: report?.ai_dismissal_reason ?? '',
        master_concern_id: report?.ai_duplicate_id ?? '',
        due_date: report?.due_date ?? report?.max_due_date ?? '',
    });

    const isTerminal = ['resolved', 'rejected', 'merged', 'closed'].includes(report?.status);
    const safeLat = report?.lat ? Number(report.lat) : TAMBO_CENTER[0];
    const safeLng = report?.lng ? Number(report.lng) : TAMBO_CENTER[1];

    const togglePersonnelSelection = (id: string) => {
        startTransition(() => {
            const currentIds = [...data.personnel_ids];
            if (currentIds.includes(id)) {
                setData('personnel_ids', currentIds.filter(item => item !== id));
            } else {
                setData('personnel_ids', [...currentIds, id]);
            }
        });
    };

    const handleConfirmAiVerdict = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/reports/${report.id}/confirm-ai-verdict`, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title={report ? `Report ${report?.id?.substring(0, 8)}` : "Report"}>
            <Head title={`Review: ${report?.title ?? 'Incident'}`} />
            
            <div className="w-full space-y-8 pb-16">
                
                {/* Immersive Top Command Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                            <Link href="/admin/reports" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Queue
                            </Link>
                        </Button>
                        <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Report Ref:</span>
                            <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                #{report?.id?.substring(0, 8).toUpperCase() ?? 'INC-0000'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="text-xs font-black px-3.5 py-1.5 bg-blue-50/70 border-blue-200 text-blue-800 shadow-2xs uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            Status: {report?.status ?? 'Pending'}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-black px-3.5 py-1.5 bg-slate-900 border-slate-900 text-white shadow-2xs uppercase tracking-wider">
                            {report?.severity ?? 'Medium'} Priority
                        </Badge>
                    </div>
                </div>

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Sparkles className="h-3 w-3" /> AI Triage & Verification Suite
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            {report?.title ?? 'Incident Review Console'}
                        </h1>
                    </div>
                    
                    {report?.submitted_at && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Logged on {report.submitted_at}</span>
                        </div>
                    )}
                </div>

                {/* Merged Banner Alert if applicable */}
                {report?.duplicate_of_id && (
                    <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-purple-50 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-xs shrink-0">
                                <GitMerge className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">Merged Into Master Concern</h4>
                                <p className="text-xs font-medium text-purple-900 mt-0.5">
                                    Consolidated into parent ticket: <strong className="font-bold text-purple-950">{report.duplicate_of_title ?? report.duplicate_of_id}</strong>
                                    {report.duplicate_of_reporter && ` (Reported by ${report.duplicate_of_reporter})`}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="bg-white border-purple-300 text-purple-900 text-xs font-bold shadow-2xs shrink-0 hover:bg-purple-100">
                            <Link href={`/admin/reports/${report.duplicate_of_id}`}>View Master Ticket</Link>
                        </Button>
                    </div>
                )}

                {/* Global Error Notice */}
                {Object.keys(errors).length > 0 && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
                        <div>
                            <span className="font-bold block mb-1">Validation Error:</span>
                            Unable to process the action. Please check the required fields below.
                        </div>
                    </div>
                )}

                {/* Main Asymmetric Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Incident Narrative & Scope</h3>
                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                                    {report?.category ?? 'Community Concern'}
                                </span>
                            </div>

                            <div className="rounded-2xl bg-slate-50/80 p-5 border border-slate-100">
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    {report?.description ?? 'No detailed description provided for this incident.'}
                                </p>
                            </div>

                            {report?.images && report.images.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Attached Evidence Photos</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {report.images.map((url: string, idx: number) => (
                                            <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-2xs">
                                                <img 
                                                    src={url} 
                                                    alt="Evidence Attachment" 
                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold flex items-center gap-2 text-slate-800 text-xs uppercase tracking-wider">
                                        <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                        <span>{report?.location_label ?? 'Pinned location'}</span>
                                    </h4>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
                                    <MapView 
                                        center={[safeLat, safeLng]} 
                                        pins={[{
                                            id: report?.id,
                                            lat: safeLat,
                                            lng: safeLng,
                                            title: report?.title,
                                            severity: report?.severity ?? 'medium',
                                        }]} 
                                        className="h-72 w-full z-0 relative" 
                                    />
                                </div>
                            </div>
                        </div>

                        {report?.merged_duplicates && report.merged_duplicates.length > 0 && (
                            <div className="rounded-3xl border border-blue-200/80 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                                            <GitMerge className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">
                                                Consolidated Duplicate Reports
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {report.merged_duplicates.length} other resident reports mapped to this master record
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {report.merged_duplicates.map((dup: any) => (
                                        <div key={dup.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3.5 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-900">{dup.title}</h4>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                                                        <span className="flex items-center gap-1 font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                                                            <User className="h-3 w-3 text-slate-400" />
                                                            {dup.reporter_name || 'Resident'}
                                                        </span>
                                                        {dup.reporter_mobile && (
                                                            <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200/60">
                                                                <Phone className="h-3 w-3 text-slate-400" />
                                                                {dup.reporter_mobile}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            {dup.submitted_at}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" asChild className="h-8 text-xs font-bold text-blue-600 bg-white border-slate-200 hover:bg-blue-50 shadow-2xs">
                                                    <Link href={`/admin/reports/${dup.id}`}>View Raw</Link>
                                                </Button>
                                            </div>

                                            <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                                                "{dup.description}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-white p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-blue-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                                        <Zap className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-blue-950">AI Triage Intelligence</h3>
                                        <p className="text-[11px] font-bold text-blue-700/80">Automated classification & telemetry</p>
                                    </div>
                                </div>
                                <Badge className="uppercase font-black tracking-wider bg-blue-700 text-white px-3.5 py-1 text-xs shadow-2xs">
                                    {overrideAction ?? report?.ai_recommended_action ?? 'Escalate'}
                                </Badge>
                            </div>

                            <div className="rounded-2xl bg-white p-4 border border-blue-100/80 shadow-2xs space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Reasoning Engine</span>
                                <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                                    "{report?.ai_action_reason ?? 'AI analyzed telemetry, category playbooks, and community density to recommend standard deployment workflow.'}"
                                </p>
                                {Array.isArray(report?.prescriptive_steps) && report.prescriptive_steps.length > 0 ? (
                                    <ol className="space-y-2 pt-2">
                                        {report.prescriptive_steps.map((step: unknown, index: number) => (
                                            <li key={index} className="flex gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-800 font-black text-[10px]">
                                                    {index + 1}
                                                </span>
                                                <span className="pt-0.5">{formatStep(step)}</span>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="pt-1 text-xs text-slate-500 font-medium">
                                        No prescriptive steps are available for this report.
                                    </p>
                                )}
                            </div>

                            {report?.ai_duplicate_id && (
                                <div className="space-y-3.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-xs shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-amber-950 flex items-center gap-2">
                                            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" /> Potential Duplicate Match
                                        </h4>
                                        {report.ai_duplicate_similarity != null && (
                                            <Badge className="bg-amber-600 text-white font-extrabold text-[10px] px-2 py-0.5">
                                                {Math.round(report.ai_duplicate_similarity * 100)}% match
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-amber-900 leading-relaxed font-medium">
                                        Matches <strong>{report.ai_duplicate_title ?? 'another report'}</strong>
                                        {report.ai_duplicate_reporter && ` by ${report.ai_duplicate_reporter}`}.
                                    </p>
                                    
                                    <div className="pt-1 flex flex-wrap gap-2">
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => {
                                                setOverrideAction('merge');
                                                setData('confirmed_action', 'merge');
                                                setData('master_concern_id', report.ai_duplicate_id);
                                            }}
                                            className="h-8 text-xs font-bold bg-white text-amber-950 border-amber-300 hover:bg-amber-100 cursor-pointer shadow-2xs"
                                        >
                                            <GitMerge className="h-3.5 w-3.5 mr-1.5 text-amber-700" /> Select For Merge
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!isTerminal ? (
                                <form onSubmit={handleConfirmAiVerdict} className="space-y-5 pt-2">
                                    
                                    {/* Escalate Specific Fields */}
                                    {(overrideAction ?? report?.ai_recommended_action) === 'escalate' && (
                                        <>
                                            <div className="space-y-2">
                                                <label htmlFor="mission-due-date" className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                                    Mission Due Date Target
                                                </label>
                                                <Input
                                                    id="mission-due-date"
                                                    type="date"
                                                    value={data.due_date}
                                                    max={report?.max_due_date}
                                                    onChange={(e) => setData('due_date', e.target.value)}
                                                    required
                                                    className="bg-white text-xs h-11 border-slate-200 rounded-2xl shadow-2xs font-semibold"
                                                />
                                                {errors.due_date && <p className="text-[11px] font-bold text-red-600 mt-1">{errors.due_date}</p>}
                                            </div>

                                            <div className="space-y-2.5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700">Matched Personnel Units</label>
                                                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg font-black">AI Recommended</span>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 p-3 space-y-2 bg-white shadow-2xs">
                                                    {personnel.length === 0 ? (
                                                        <p className="text-xs text-muted-foreground p-4 text-center">No active personnel available online.</p>
                                                    ) : (
                                                        personnel.map(p => {
                                                            const isAiSuggested = report?.assigned_personnel_ids?.includes(p.id);
                                                            return (
                                                                <label key={p.id} className={cn(
                                                                    "flex items-center justify-between cursor-pointer text-xs p-3 rounded-xl transition-all border",
                                                                    data.personnel_ids.includes(p.id) 
                                                                        ? "bg-blue-50/90 border-blue-300 font-bold shadow-2xs" 
                                                                        : "border-slate-100 hover:bg-slate-50 bg-white"
                                                                )}>
                                                                    <div className="flex items-center gap-3">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={data.personnel_ids.includes(p.id)}
                                                                            onChange={() => togglePersonnelSelection(p.id)}
                                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                                        />
                                                                        <div>
                                                                            <span className="font-bold text-slate-900">{p.name}</span>
                                                                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{p.category}</p>
                                                                        </div>
                                                                    </div>
                                                                    {isAiSuggested && (
                                                                        <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                                                                            Best Match
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                                {errors.personnel_ids && <p className="text-[11px] font-bold text-red-600 mt-1">{errors.personnel_ids}</p>}
                                            </div>
                                        </>
                                    )}

                                    {/* Merge Specific Fields */}
                                    {(overrideAction ?? report?.ai_recommended_action) === 'merge' && (
                                        <div className="space-y-2">
                                            <label htmlFor="master-concern" className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                                Select Master Concern
                                            </label>
                                            <select
                                                id="master-concern"
                                                value={data.master_concern_id}
                                                onChange={(e) => setData('master_concern_id', e.target.value)}
                                                required
                                                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold shadow-2xs"
                                            >
                                                <option value="" disabled>Choose the primary master ticket...</option>
                                                {report?.ai_duplicate_id && (
                                                    <option value={report.ai_duplicate_id}>
                                                        [AI Suggestion] {report.ai_duplicate_title}
                                                    </option>
                                                )}
                                                {/* Fallback to list master candidates if provided by backend */}
                                            </select>
                                            {errors.master_concern_id && <p className="text-[11px] font-bold text-red-600 mt-1">{errors.master_concern_id}</p>}
                                        </div>
                                    )}

                                    {/* Dismiss Specific Fields */}
                                    {(overrideAction ?? report?.ai_recommended_action) === 'dismiss' && (
                                        <div className="space-y-2">
                                            <label htmlFor="rejection-reason" className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                                Reason for rejection
                                            </label>
                                            <textarea
                                                id="rejection-reason"
                                                value={data.rejection_reason}
                                                onChange={(event) => setData('rejection_reason', event.target.value)}
                                                required
                                                minLength={3}
                                                maxLength={1000}
                                                rows={3}
                                                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold shadow-2xs"
                                            />
                                            {errors.rejection_reason && (
                                                <p className="text-[11px] font-bold text-red-600 mt-1">{errors.rejection_reason}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-4 space-y-3.5 border-t border-blue-100">
                                        <Button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 shadow-sm cursor-pointer rounded-2xl transition-all">
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> 
                                            {processing ? 'Processing...' : 'Confirm AI Verdict & Execute Dispatch'}
                                        </Button>

                                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 pt-1">
                                            <span className="text-slate-400">Manual Override:</span>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => { setOverrideAction('escalate'); setData('confirmed_action', 'escalate'); }} className={cn("hover:underline cursor-pointer font-bold", data.confirmed_action === 'escalate' ? 'text-slate-800' : 'text-blue-600')}>Escalate</button>
                                                <span className="text-slate-300">•</span>
                                                <button type="button" onClick={() => { setOverrideAction('merge'); setData('confirmed_action', 'merge'); }} className={cn("hover:underline cursor-pointer font-bold", data.confirmed_action === 'merge' ? 'text-slate-800' : 'text-blue-600')}>Merge</button>
                                                <span className="text-slate-300">•</span>
                                                <button type="button" onClick={() => { setOverrideAction('dismiss'); setData('confirmed_action', 'dismiss'); }} className={cn("hover:underline cursor-pointer font-bold", data.confirmed_action === 'dismiss' ? 'text-slate-800' : 'text-blue-600')}>Dismiss</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                                    <p className="text-xs font-black text-emerald-900">
                                        ✓ Report successfully processed and locked in terminal state.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}