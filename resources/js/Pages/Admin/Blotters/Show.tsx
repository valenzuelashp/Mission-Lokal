import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

type BlotterDetail = {
    id: string;
    ticket_number: string | null;
    type: string;
    complainant: string;
    respondent: string;
    incident_date: string;
    location: string;
    narrative: string;
    relief_sought: string;
    status: string;
    created_at: string;
};

export default function Show({ blotter }: { blotter: BlotterDetail }) {
    
    const handleApprove = () => {
        if (confirm("Are you sure you want to officially file this blotter and issue a ticket number?")) {
            router.post(`/admin/blotters/${blotter.id}/approve`);
        }
    };

    return (
        <AdminLayout title="Review Blotter">
            <Head title="Review Blotter" />
            
            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-sm" asChild>
                <Link href="/admin/blotters">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to blotter desk
                </Link>
            </Button>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {blotter.ticket_number ?? 'Pending Blotter Review'}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Submitted on {blotter.created_at}</p>
                </div>
                <div>
                    <Badge variant={blotter.status === 'pending_approval' ? 'secondary' : 'default'} className="text-sm px-3 py-1">
                        {(blotter.status || '').replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT COLUMN: Narrative Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="mb-3 text-lg font-semibold text-blue-900">Statement of Facts</h3>
                            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{blotter.narrative}</p>
                            
                            <h3 className="mt-6 mb-3 text-lg font-semibold text-blue-900">Relief Sought</h3>
                            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{blotter.relief_sought}</p>
                        </CardContent>
                    </Card>

                    {/* Action Authorization Deck */}
                    {blotter.status === 'pending_approval' && (
                        <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
                            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-semibold text-emerald-900">Official Review Required</h4>
                                    <p className="text-sm text-emerald-800">Review the statement above. Approving this will generate an official sequential ticket number.</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" className="bg-white hover:bg-slate-100">Reject</Button>
                                    <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve & Issue Ticket
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN: Case Metadata */}
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardContent className="p-6 space-y-4 text-sm">
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Blotter Type</p>
                                <p className="font-medium text-slate-900 mt-0.5">{blotter.type}</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complainant</p>
                                <p className="font-medium text-blue-700 mt-0.5">{blotter.complainant}</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Respondent</p>
                                <p className="font-medium text-red-700 mt-0.5">{blotter.respondent}</p>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident Date</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-900">{blotter.incident_date}</span>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</p>
                                <p className="text-slate-900 mt-0.5">{blotter.location}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}