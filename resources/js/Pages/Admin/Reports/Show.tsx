import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Zap, MapPin } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import MapView from '@/Components/maps/MapView';
import { Badge } from '@/Components/ui/badge';

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

    const { data, setData, post, processing } = useForm({
        concern_id: report?.id ?? '',
        personnel_ids: report?.assigned_personnel_ids ?? [] as string[],
        confirmed_action: report?.ai_recommended_action ?? 'escalate',
        rejection_reason: report?.ai_dismissal_reason ?? '',
        master_concern_id: report?.ai_duplicate_id ?? '',
    });

    const isTerminal = ['resolved', 'rejected', 'merged', 'closed'].includes(report?.status);
    const safeLat = report?.lat ? Number(report.lat) : 14.6507;
    const safeLng = report?.lng ? Number(report.lng) : 120.9793;

    const togglePersonnelSelection = (id: string) => {
        const currentIds = [...data.personnel_ids];
        if (currentIds.includes(id)) {
            setData('personnel_ids', currentIds.filter(item => item !== id));
        } else {
            setData('personnel_ids', [...currentIds, id]);
        }
    };

    const handleConfirmAiVerdict = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/reports/${report.id}/confirm-ai-verdict`, {
            onSuccess: () => {},
        });
    };

    return (
        <AdminLayout title={report ? `Report ${report?.id?.substring(0, 8)}` : "Report"}>
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/reports" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
                <h2 className="text-2xl font-semibold">AI Verdict & Action Review</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">{report?.title}</h3>
                            <Badge variant="outline" className="capitalize">{report?.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed mb-6">{report?.description}</p>
                        
                        {report?.images && report.images.length > 0 && (
                            <div className="mb-6 flex gap-2 overflow-x-auto">
                                {report.images.map((url: string, idx: number) => (
                                    <img 
                                        key={idx} 
                                        src={url} 
                                        alt="Report Attachment" 
                                        className="h-32 w-32 shrink-0 rounded-lg border border-slate-200 object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="border-t pt-6">
                            <h4 className="mb-3 font-semibold flex items-center gap-2 text-slate-800">
                                <MapPin className="h-4 w-4 text-slate-500" />
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
                                className="h-64 rounded-md border shadow-sm z-0 relative" 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* AI VERDICT REVIEW CARD */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm border-blue-200 bg-blue-50/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-bold text-blue-900">AI Triage Verdict</h3>
                        </div>

                        <div className="space-y-3 mb-5 text-sm">
                            <div className="flex justify-between items-center bg-white p-2.5 rounded border">
                                <span className="text-muted-foreground font-medium">Recommended Action:</span>
                                <Badge className="uppercase font-bold tracking-wide bg-blue-700 text-white">
                                    {report?.ai_recommended_action ?? 'Escalate'}
                                </Badge>
                            </div>
                            <p className="text-slate-600 italic bg-white/80 p-3 rounded border text-xs">
                                "{report?.ai_action_reason ?? 'AI analyzed evidence and recommends standard workflow dispatch.'}"
                            </p>
                        </div>

                        {!isTerminal ? (
                            <form onSubmit={handleConfirmAiVerdict} className="space-y-4">
                                {/* If AI recommended Escalation, show AI-suggested personnel highlighted */}
                                {(overrideAction ?? report?.ai_recommended_action) === 'escalate' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-slate-700">Suggested Personnel Match</label>
                                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">AI Matched</span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto rounded-md border border-slate-300 p-2.5 space-y-2 bg-white">
                                            {personnel.length === 0 ? (
                                                <p className="text-xs text-muted-foreground">No active personnel found.</p>
                                            ) : (
                                                personnel.map(p => {
                                                    const isAiSuggested = report?.assigned_personnel_ids?.includes(p.id);
                                                    return (
                                                        <label key={p.id} className={`flex items-center justify-between cursor-pointer text-sm p-1.5 rounded transition-colors ${isAiSuggested ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.personnel_ids.includes(p.id)}
                                                                    onChange={() => togglePersonnelSelection(p.id)}
                                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                                />
                                                                <div>
                                                                    <span className="font-medium text-slate-900">{p.name}</span>
                                                                    <p className="text-[11px] text-muted-foreground">{p.category} {p.subcategories?.length ? `(${p.subcategories.join(', ')})` : ''}</p>
                                                                </div>
                                                            </div>
                                                            {isAiSuggested && <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Best Match</span>}
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* If AI recommended Merge */}
                                {(overrideAction ?? report?.ai_recommended_action) === 'merge' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-slate-700">Target Master Report</label>
                                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">AI Duplicate Match</span>
                                        </div>
                                        <select 
                                            className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm" 
                                            value={data.master_concern_id}
                                            onChange={(e) => setData('master_concern_id', e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select Parent Report</option>
                                            {masterCandidates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* If AI recommended Dismiss */}
                                {(overrideAction ?? report?.ai_recommended_action) === 'dismiss' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-slate-700">AI Generated Dismissal Reason</label>
                                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">AI Reason</span>
                                        </div>
                                        <Input 
                                            value={data.rejection_reason} 
                                            onChange={(e) => setData('rejection_reason', e.target.value)} 
                                            placeholder="Provide reason for dismissal..."
                                            required 
                                            className="bg-white"
                                        />
                                    </div>
                                )}

                                <div className="pt-2 flex flex-col gap-2">
                                    <Button type="submit" disabled={processing} className="w-full bg-blue-700 hover:bg-blue-800">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm AI Verdict & Execute
                                    </Button>

                                    {/* Override options */}
                                    <div className="flex justify-between items-center pt-2 text-xs text-muted-foreground border-t">
                                        <span>Override AI Decision:</span>
                                        <div className="flex gap-1">
                                            <button type="button" onClick={() => { setOverrideAction('escalate'); setData('confirmed_action', 'escalate'); }} className="underline hover:text-blue-700">Escalate</button>
                                            <span>•</span>
                                            <button type="button" onClick={() => { setOverrideAction('merge'); setData('confirmed_action', 'merge'); }} className="underline hover:text-blue-700">Merge</button>
                                            <span>•</span>
                                            <button type="button" onClick={() => { setOverrideAction('dismiss'); setData('confirmed_action', 'dismiss'); }} className="underline hover:text-blue-700">Dismiss</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm font-medium text-emerald-700 text-center py-2 bg-emerald-50 rounded border border-emerald-200">
                                Report has been processed and is in terminal state.
                            </p>
                        )}
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Prescriptive Steps</h3>
                        {Array.isArray(report?.prescriptive_steps) && report.prescriptive_steps.length > 0 ? (
                            <ol className="space-y-3">
                                {report.prescriptive_steps.map((step: unknown, index: number) => (
                                    <li key={index} className="flex gap-3 text-sm text-slate-700">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {index + 1}
                                        </span>
                                        <span className="pt-0.5">{formatStep(step)}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-sm text-muted-foreground">No prescriptive steps available.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}