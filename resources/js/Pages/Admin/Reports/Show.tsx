import { useState, useTransition } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Zap, MapPin, ShieldAlert } from 'lucide-react';
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
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">AI Triage & Review Console</h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Evaluating evidence, location telemetry, and automated AI prescriptive playbooks.</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize font-extrabold px-3 py-1 bg-white">{report?.status}</Badge>
            </div>

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
                                    {report?.ai_recommended_action ?? 'Escalate'}
                                </Badge>
                            </div>
                            <p className="text-slate-700 italic bg-white/90 p-3.5 rounded-xl border border-slate-200/80 font-medium">
                                "{report?.ai_action_reason ?? 'AI analyzed evidence and recommends standard workflow dispatch.'}"
                            </p>
                        </div>

                        {report?.ai_duplicate_id && (
                            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs">
                                <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" /> Potential Duplicate Report
                                </h4>
                                <p className="text-amber-900 leading-relaxed font-medium">
                                    Matches <strong>{report.ai_duplicate_title ?? 'another report'}</strong>
                                    {report.ai_duplicate_similarity != null && ` (${Math.round(report.ai_duplicate_similarity * 100)}% similarity)`}.
                                </p>
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