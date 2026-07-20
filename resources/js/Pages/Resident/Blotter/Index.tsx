import { Head, Link } from '@inertiajs/react';
import { FileText, Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import PageHeader from '@/Components/shared/PageHeader';

declare function route(name: string, parameters?: any, absolute?: boolean): string;

type ResidentBlotter = {
    id: string;
    ticket_number: string | null;
    type: string;
    incident_date: string;
    status: string;
    created_at: string;
};

export default function Index({ blotters }: { blotters: ResidentBlotter[] }) {
    return (
        <ResidentLayout>
            <Head title="My Blotter Records" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <PageHeader 
                    title="My Blotter Records" 
                    description="Track the status of your formal legal complaints and incident logs." 
                />
                <Button asChild className="w-full sm:w-auto mt-4 sm:mt-0">
                    <Link href={route('blotter.create')}>
                        <Plus className="mr-2 h-4 w-4" /> File New Blotter
                    </Link>
                </Button>
            </div>

            <div className="mt-6 space-y-4">
                {blotters.length === 0 ? (
                    <Card className="border-dashed shadow-none bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <ShieldCheck className="mb-4 h-12 w-12 text-slate-300" />
                            <p className="text-base font-medium text-slate-900">No blotter records found.</p>
                            <p className="text-sm mt-1">You haven't filed any formal complaints yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    blotters.map((blotter) => (
                        <Card key={blotter.id} className="shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        {blotter.ticket_number ?? 'Pending Review'}
                                    </CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">Filed on {blotter.created_at}</p>
                                </div>
                                <Badge 
                                    variant={blotter.status === 'pending_approval' ? 'secondary' : 'default'}
                                    className="uppercase tracking-wider text-xs"
                                >
                                    {blotter.status.replace('_', ' ')}
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-2 gap-4 text-sm mt-2 border-t pt-4">
                                    <div>
                                        <p className="text-slate-500">Record Type</p>
                                        <p className="font-medium text-slate-900">{blotter.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Incident Date</p>
                                        <p className="font-medium text-slate-900">{blotter.incident_date}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </ResidentLayout>
    );
}