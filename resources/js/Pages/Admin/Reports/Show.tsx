import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, XCircle, GitMerge, Zap } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

interface Props {
    report: any;
    masterCandidates?: { id: string; label: string }[];
}

export default function Show({ report, masterCandidates = [] }: Props) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedMasterId, setSelectedMasterId] = useState('');
    const [assignedTeam, setAssignedTeam] = useState('');
    const [missionNotes] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [showMergeSelect, setShowMergeSelect] = useState(false);
    const [showMissionForm, setShowMissionForm] = useState(false);

    const isTerminal = ['resolved', 'rejected', 'merged'].includes(report?.status);

    return (
        <AdminLayout title={report ? `Report ${report.id.substring(0, 8)}` : "Report"}>
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/reports" className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></Link>
                <h2 className="text-2xl font-semibold">Report Action Control</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="text-xl font-bold mb-4">{report.title}</h3>
                        <p className="text-sm text-slate-700">{report.description}</p>
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
                                <Input placeholder="Team" value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)} className="mb-2" />
                                <Button type="submit" className="w-full">Launch Mission</Button>
                            </form>
                        )}

                        {showMergeSelect && (
                            <form onSubmit={(e) => { e.preventDefault(); router.post(`/admin/reports/${report.id}/merge`, { master_concern_id: selectedMasterId }); }}>
                                <select className="w-full border p-2 mb-2" onChange={(e) => setSelectedMasterId(e.target.value)}>
                                    <option value="">Select Parent</option>
                                    {masterCandidates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                                <Button type="submit" className="w-full">Merge</Button>
                            </form>
                        )}

                        {showRejectInput && (
                            <form onSubmit={(e) => { e.preventDefault(); router.post(`/admin/reports/${report.id}/reject`, { rejection_reason: rejectionReason }); }}>
                                <Input placeholder="Reason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mb-2" />
                                <Button type="submit" variant="destructive" className="w-full">Confirm Reject</Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}