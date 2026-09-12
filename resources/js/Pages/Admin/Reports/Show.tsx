import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, XCircle, GitMerge, Zap, MapPin } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import MapView from '@/Components/maps/MapView';

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
    personnel?: { id: string; name: string; category: string }[];
}

export default function Show({ report, masterCandidates = [], personnel = [] }: Props) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedMasterId, setSelectedMasterId] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [showMergeSelect, setShowMergeSelect] = useState(false);
    const [showMissionForm, setShowMissionForm] = useState(false);

    // Form to handle multiple personnel IDs when escalating from report (pre-filled if already assigned)
    const { data, setData, post, processing, errors } = useForm({
        concern_id: report?.id ?? '',
        personnel_ids: report?.assigned_personnel_ids ?? [] as string[],
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

    const handleEscalate = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/reports/${report.id}/escalate`, {
            onSuccess: () => setShowMissionForm(false),
        });
    };

    return (
        <AdminLayout title={report ? `Report ${report?.id?.substring(0, 8)}` : "Report"}>
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/reports" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
                <h2 className="text-2xl font-semibold">Report Action Control</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{report?.title}</h3>
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

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        {!isTerminal && !showMissionForm && !showRejectInput && !showMergeSelect && (
                            <div className="flex flex-col gap-2">
                                <Button onClick={() => setShowMissionForm(true)}><Zap className="mr-2 h-4 w-4" /> Escalate to Mission</Button>
                                <Button variant="outline" onClick={() => setShowMergeSelect(true)}><GitMerge className="mr-2 h-4 w-4" /> Merge</Button>
                                <Button variant="ghost" className="text-red-600" onClick={() => setShowRejectInput(true)}><XCircle className="mr-2 h-4 w-4" /> Dismiss</Button>
                            </div>
                        )}

                        {showMissionForm && (
                            <form onSubmit={handleEscalate} className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Assign Personnel (Select one or more)</label>
                                <div className="max-h-48 overflow-y-auto rounded-md border border-slate-300 p-2.5 space-y-2 bg-slate-50">
                                    {personnel.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No active personnel found.</p>
                                    ) : (
                                        personnel.map(p => (
                                            <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-100 p-1.5 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={data.personnel_ids.includes(p.id)}
                                                    onChange={() => togglePersonnelSelection(p.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span>{p.name} <span className="text-xs text-muted-foreground">({p.category})</span></span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {errors.personnel_ids && <p className="text-xs text-red-600">{errors.personnel_ids}</p>}

                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" disabled={processing} className="w-full bg-blue-700 hover:bg-blue-800">
                                        {processing ? 'Launching...' : 'Confirm & Launch Mission'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowMissionForm(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}

                        {showMergeSelect && (
                            <form onSubmit={(e) => { e.preventDefault(); router.post(`/admin/reports/${report.id}/merge`, { master_concern_id: selectedMasterId }); }}>
                                <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mb-3" 
                                    onChange={(e) => setSelectedMasterId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled selected>Select Parent Report</option>
                                    {masterCandidates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <Button type="submit" className="w-full">Merge</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowMergeSelect(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}

                        {showRejectInput && (
                            <form onSubmit={(e) => { e.preventDefault(); router.post(`/admin/reports/${report.id}/reject`, { rejection_reason: rejectionReason }); }}>
                                <Input placeholder="Reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mb-3" required />
                                <div className="flex gap-2">
                                    <Button type="submit" variant="destructive" className="w-full">Confirm Reject</Button>
                                    <Button type="button" variant="outline" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}