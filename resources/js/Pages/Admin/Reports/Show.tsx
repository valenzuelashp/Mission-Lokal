import { useState, useTransition } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Zap, MapPin, ShieldAlert, GitMerge, User, Phone, Calendar } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import MapView from '@/Components/maps/MapView';
import { Badge } from '@/Components/ui/badge';
import { TAMBO_CENTER } from '@/Lib/mapUtils';

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

export default function Show({ report, masterCandidates = [], personnel = [] }: Props) {
    const [overrideAction, setOverrideAction] = useState<string | null>(null);
    const [, startTransition] = useTransition();

    const { data, setData, post, processing } = useForm({
        concern_id: report?.id ?? '',
        personnel_ids: report?.assigned_personnel_ids ?? [] as string[],
        confirmed_action: report?.ai_recommended_action ?? 'escalate',
        rejection_reason: report?.ai_dismissal_reason ?? '',
        master_concern_id: report?.ai_duplicate_id ?? '',
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
            onSuccess: () => {},
        });
    };

    return (
        <AdminLayout title={report ? `Report ${report?.id?.substring(0, 8)}` : "Report"}>
            <Head title={`Review: ${report?.title ?? 'Incident'}`} />
            
            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/reports">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Report Queue
                    </Link>
                </Button>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">AI Triage & Review Console</h2>
                        {report?.duplicate_of_id && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-extrabold text-xs">
                                <GitMerge className="h-3 w-3 mr-1" /> Merged Duplicate
                            </Badge>
                        )}
                        {report?.merged_duplicates && report.merged_duplicates.length > 0 && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-extrabold text-xs">
                                <GitMerge className="h-3 w-3 mr-1" /> Master Concern ({report.merged_duplicates.length} Linked)
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Evaluating evidence, location telemetry, and automated AI prescriptive playbooks.</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize font-extrabold px-3 py-1 bg-white">{report?.status}</Badge>
            </div>

            {report?.duplicate_of_id && (
                <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50/70 p-4 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 text-white rounded-xl">
                            <GitMerge className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-purple-950 uppercase tracking-wider">Merged Into Master Concern</p>
                            <p className="text-xs font-medium text-purple-900">
                                This report was consolidated into: <strong className="font-bold">{report.duplicate_of_title ?? report.duplicate_of_id}</strong>
                                {report.duplicate_of_reporter && ` (Reported by ${report.duplicate_of_reporter})`}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="bg-white border-purple-200 text-purple-900 text-xs font-bold shadow-2xs">
                        <Link href={`/admin/reports/${report.duplicate_of_id}`}>View Master Ticket</Link>
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900">{report?.title}</h3>
                            <Badge className="capitalize font-bold text-xs">{report?.severity} Severity</Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">{report?.description}</p>
                        
                        {report?.images && report.images.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Evidence Photo Attachments</h4>
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                    {report.images.map((url: string, idx: number) => (
                                        <img 
                                            key={idx} 
                                            src={url} 
                                            alt="Report Attachment" 
                                            className="h-36 w-36 shrink-0 rounded-xl border border-slate-200 object-cover shadow-2xs"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-5">
                            <h4 className="mb-3 font-bold flex items-center gap-2 text-slate-800 text-xs uppercase tracking-wider">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                {report?.location_label}
                            </h4>
                            <MapView 
                                center={[safeLat, safeLng]} 
                                pins={[{
                                    id: report?.id,
                                    lat: safeLat,
                                    lng: safeLng,
                                    title: report?.title,
                                    severity: report?.severity ?? 'medium',
                                }]} 
                                className="h-64 rounded-xl border border-slate-200 shadow-2xs z-0 relative overflow-hidden" 
                            />
                        </div>
                    </div>

                    {/* MERGED DUPLICATE REPORTS LIST */}
                    {report?.merged_duplicates && report.merged_duplicates.length > 0 && (
                        <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                                        <GitMerge className="h-4 w-4" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900">
                                        Consolidated Duplicate Reports ({report.merged_duplicates.length})
                                    </h3>
                                </div>
                                <span className="text-[11px] font-bold text-slate-500">
                                    Multiple residents reported this same incident
                                </span>
                            </div>

                            <div className="space-y-3">
                                {report.merged_duplicates.map((dup: any) => (
                                    <div key={dup.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900">{dup.title}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                                                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        {dup.reporter_name || 'Resident'}
                                                    </span>
                                                    {dup.reporter_mobile && (
                                                        <span className="flex items-center gap-1">
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
                                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-bold text-blue-600 hover:text-blue-800">
                                                <Link href={`/admin/reports/${dup.id}`}>View Raw</Link>
                                            </Button>
                                        </div>

                                        <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed font-medium">
                                            "{dup.description}"
                                        </p>

                                        {dup.images && dup.images.length > 0 && (
                                            <div className="flex gap-2 overflow-x-auto pt-1">
                                                {dup.images.map((img: string, i: number) => (
                                                    <img key={i} src={img} alt="Resident photo" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* AI VERDICT REVIEW CARD */}
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-white p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-blue-100 pb-3">
                            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                                <Zap className="h-4 w-4" />
                            </div>
                            <h3 className="text-base font-black text-blue-900">AI Triage Verdict</h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                                <span className="text-slate-500 font-bold uppercase">Recommended Action:</span>
                                <Badge className="uppercase font-black tracking-wide bg-blue-700 text-white px-2.5 py-0.5">
                                    {overrideAction ?? report?.ai_recommended_action ?? 'Escalate'}
                                </Badge>
                            </div>
                            <p className="text-slate-700 italic bg-white/90 p-3.5 rounded-xl border border-slate-200/80 font-medium">
                                "{report?.ai_action_reason ?? 'AI analyzed evidence and recommends standard workflow dispatch.'}"
                            </p>
                        </div>

                        {report?.ai_duplicate_id && (
                            <div className="space-y-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-amber-950 flex items-center gap-1.5">
                                        <ShieldAlert className="h-4 w-4 text-amber-600" /> Potential Duplicate Report
                                    </h4>
                                    {report.ai_duplicate_similarity != null && (
                                        <Badge className="bg-amber-600 text-white font-extrabold text-[10px]">
                                            {Math.round(report.ai_duplicate_similarity * 100)}% match
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-amber-900 leading-relaxed font-medium">
                                    Matches <strong>{report.ai_duplicate_title ?? 'another report'}</strong>
                                    {report.ai_duplicate_reporter && ` by ${report.ai_duplicate_reporter}`}.
                                    {report.ai_duplicate_reporter_count && ` (${report.ai_duplicate_reporter_count} residents reported similar incidents in this radius).`}
                                </p>
                                {report.ai_duplicate_description && (
                                    <p className="text-[11px] text-amber-800 bg-white/80 p-2.5 rounded-lg border border-amber-200/70 italic line-clamp-3">
                                        "{report.ai_duplicate_description}"
                                    </p>
                                )}
                                <div className="pt-1 flex gap-2">
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => {
                                            setOverrideAction('merge');
                                            setData('confirmed_action', 'merge');
                                            setData('master_concern_id', report.ai_duplicate_id);
                                        }}
                                        className="h-7 text-xs font-bold bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                                    >
                                        <GitMerge className="h-3.5 w-3.5 mr-1" /> Quick Select For Merge
                                    </Button>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="ghost" 
                                        asChild 
                                        className="h-7 text-xs font-bold text-amber-900 hover:text-amber-950"
                                    >
                                        <Link href={`/admin/reports/${report.ai_duplicate_id}`}>Inspect Parent</Link>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isTerminal ? (
                            <form onSubmit={handleConfirmAiVerdict} className="space-y-4 pt-2">
                                {(overrideAction ?? report?.ai_recommended_action) === 'escalate' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-black uppercase tracking-wider text-slate-700">Matched Personnel Units</label>
                                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-extrabold">AI Recommended</span>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 p-2.5 space-y-2 bg-white">
                                            {personnel.length === 0 ? (
                                                <p className="text-xs text-muted-foreground p-2 text-center">No active personnel available.</p>
                                            ) : (
                                                personnel.map(p => {
                                                    const isAiSuggested = report?.assigned_personnel_ids?.includes(p.id);
                                                    return (
                                                        <label key={p.id} className={`flex items-center justify-between cursor-pointer text-xs p-2 rounded-lg transition-colors border ${isAiSuggested ? 'bg-blue-50/80 border-blue-200 font-bold' : 'border-slate-100 hover:bg-slate-50'}`}>
                                                            <div className="flex items-center gap-2.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.personnel_ids.includes(p.id)}
                                                                    onChange={() => togglePersonnelSelection(p.id)}
                                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                                                />
                                                                <div>
                                                                    <span className="font-bold text-slate-900">{p.name}</span>
                                                                    <p className="text-[10px] text-muted-foreground font-medium">{p.category}</p>
                                                                </div>
                                                            </div>
                                                            {isAiSuggested && <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Best Match</span>}
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(overrideAction ?? report?.ai_recommended_action) === 'merge' && (
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Target Master Report</label>
                                        <select 
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800" 
                                            value={data.master_concern_id}
                                            onChange={(e) => setData('master_concern_id', e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select Master Parent Report</option>
                                            {masterCandidates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                )}

                                {(overrideAction ?? report?.ai_recommended_action) === 'dismiss' && (
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">Dismissal / Rejection Reason</label>
                                        <Input 
                                            value={data.rejection_reason} 
                                            onChange={(e) => setData('rejection_reason', e.target.value)} 
                                            placeholder="Provide reason for rejection..."
                                            required 
                                            className="bg-white"
                                        />
                                    </div>
                                )}

                                <div className="pt-2 flex flex-col gap-2.5">
                                    <Button type="submit" disabled={processing} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2.5 shadow-sm cursor-pointer">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm AI Verdict & Execute Action
                                    </Button>

                                    <div className="flex justify-between items-center pt-2 text-[11px] font-bold text-slate-500 border-t border-blue-100">
                                        <span>Override Decision:</span>
                                        <div className="flex gap-1.5">
                                            <button type="button" onClick={() => { setOverrideAction('escalate'); setData('confirmed_action', 'escalate'); }} className="underline hover:text-blue-700 cursor-pointer">Escalate</button>
                                            <span>•</span>
                                            <button type="button" onClick={() => { setOverrideAction('merge'); setData('confirmed_action', 'merge'); }} className="underline hover:text-blue-700 cursor-pointer">Merge</button>
                                            <span>•</span>
                                            <button type="button" onClick={() => { setOverrideAction('dismiss'); setData('confirmed_action', 'dismiss'); }} className="underline hover:text-blue-700 cursor-pointer">Dismiss</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <p className="text-xs font-bold text-emerald-800 text-center py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                ✓ Report has been processed and is currently in terminal state.
                            </p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Prescriptive Action Playbook</h3>
                        {Array.isArray(report?.prescriptive_steps) && report.prescriptive_steps.length > 0 ? (
                            <ol className="space-y-2.5">
                                {report.prescriptive_steps.map((step: unknown, index: number) => (
                                    <li key={index} className="flex gap-3 text-xs text-slate-700 font-medium">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-black text-[10px] border border-blue-200">
                                            {index + 1}
                                        </span>
                                        <span className="pt-0.5">{formatStep(step)}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-xs text-muted-foreground">No prescriptive steps available for this category.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}