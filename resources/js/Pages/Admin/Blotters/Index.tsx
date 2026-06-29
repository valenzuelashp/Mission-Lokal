import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

// Tell TypeScript what the backend is sending us
type Blotter = {
    id: string;
    ticket_number: string;
    type: string;
    complainant: string;
    respondent: string;
    incident_date: string;
    status: string;
    created_at: string;
};

export default function Index({ blotters }: { blotters: Blotter[] }) {
    return (
        <AdminLayout title="Blotter Management">
            <Head title="Blotters" />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Blotter Desk</h2>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Incident Records</CardTitle>
                </CardHeader>
                <CardContent>
                    {!blotters || blotters.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No blotters have been filed yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-slate-50">
                                    <tr>
                                        <th className="p-3 font-semibold text-slate-600">Ticket / Status</th>
                                        <th className="p-3 font-semibold text-slate-600">Type</th>
                                        <th className="p-3 font-semibold text-slate-600">Complainant</th>
                                        <th className="p-3 font-semibold text-slate-600">Respondent</th>
                                        <th className="p-3 font-semibold text-slate-600">Date Filed</th>
                                        <th className="p-3 font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blotters.map((blotter) => (
                                        <tr key={blotter.id} className="border-b transition-colors hover:bg-slate-50">
                                            <td className="p-3">
                                                <div className="font-medium text-blue-700">{blotter.ticket_number}</div>
                                                <Badge variant={blotter.status === 'pending_approval' ? 'secondary' : 'default'} className="mt-1">
                                                    {blotter.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="p-3">{blotter.type}</td>
                                            <td className="p-3 font-medium">{blotter.complainant}</td>
                                            <td className="p-3">{blotter.respondent}</td>
                                            <td className="p-3">{blotter.created_at}</td>
                                            <td className="p-3">
                                                <Button variant="outline" size="sm" asChild>
                                                    {/* We will build this detail page next! */}
                                                    <Link href={`/admin/blotters/${blotter.id}`}>Review</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}