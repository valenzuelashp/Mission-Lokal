import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, XCircle, GitMerge, Zap, MapPin } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import MapView from '@/Components/maps/MapView';

interface Props {
    report: any;
    masterCandidates?: { id: string; label: string }[];
    personnel?: { id: string; name: string }[];
}

export default function Show({ report, masterCandidates = [], personnel = [] }: Props) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedMasterId, setSelectedMasterId] = useState('');
    const [assignedTeam, setAssignedTeam] = useState('');
    const [missionNotes] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [showMergeSelect, setShowMergeSelect] = useState(false);
    const [showMissionForm, setShowMissionForm] = useState(false);

    const isTerminal = ['resolved', 'rejected', 'merged', 'closed'].includes(report?.status);

    // SAFETY NET: Force into numbers, or fallback to default coordinates if undefined
    const safeLat = report?.lat ? Number(report.lat) : 14.6507;
    const safeLng = report?.lng ? Number(report.lng) : 120.9793;

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
                        
                        {/* IMAGES SECTION */}
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

                        {/* MAP SECTION */}
                        <div className="border-t pt-6">
                            <h4 className="mb-3 font-semibold flex items-center gap-2 text-slate-800">
                                <MapPin className="h-4 w-4 text-slate-500" />
                                {report?.location_label}
                            </h4>
                            <MapView 
                                center={[safeLat, safeLng]} 
                                pins={[{ id: report?.id, lat: safeLat, lng: safeLng, title: report?.title }]} 
                                className="h-64 rounded-md border shadow-sm z-0 relative" 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        {!isTerminal && !showMissionForm && !showRejectInput && !showMergeSelect && (
                            <div className="flex flex-col gap-2">
                                <Button onClick={() => setShowMissionForm(true)}><Zap className="mr-2 h-4 w-4" /> Escalate</Button>
                                <Button variant="outline" onClick={() => setShowMergeSelect(true)}><GitMerge className="mr-2 h-4 w-4" /> Merge</Button>
                                <Button variant="ghost" className="text-red-600" onClick={() => setShowRejectInput(true)}><XCircle className="mr-2 h-4 w-4" /> Dismiss</Button>
                            </div>
                        )}

                        {showMissionForm && (
                            <form onSubmit={(e) => { e.preventDefault(); router.post(`/admin/reports/${report.id}/escalate`, { assigned_team: assignedTeam, mission_notes: missionNotes }); }}>
                                <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mb-3" 
                                    value={assignedTeam} 
                                    onChange={(e) => setAssignedTeam(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Personnel</option>
                                    {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <Button type="submit" className="w-full">Launch Mission</Button>
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
                                <Button type="submit" className="w-full">Merge</Button>
                            </form>
                        )}

                        {showRejectInput && (
                            <form onSubmit={(e) => { e.preventDefault(); router.post(`/admin/reports/${report.id}/reject`, { rejection_reason: rejectionReason }); }}>
                                <Input placeholder="Reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mb-3" required />
                                <Button type="submit" variant="destructive" className="w-full">Confirm Reject</Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}