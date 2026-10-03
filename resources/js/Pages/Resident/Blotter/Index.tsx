import { Head, Link } from '@inertiajs/react';
import { FileText, Plus, ShieldCheck, ChevronRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import PageHeader from '@/Components/shared/PageHeader';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

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
    const theme = useResidentTheme();

    return (
        <ResidentLayout>
            <Head title="My Blotter Records" />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <PageHeader 
                    title="My Blotter Records" 
                    description="Track active mediation cases, ticket numbers, and formal incident logs." 
                />
                <Button asChild className="w-full sm:w-auto mt-2 sm:mt-0 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm cursor-pointer">
                    <Link href={route('blotter.create')}>
                        <Plus className="mr-2 h-4 w-4" /> File New Blotter
                    </Link>
                </Button>
            </div>

            <div className="mt-4 space-y-3.5">
                {blotters.length === 0 ? (
                    <Card className={`border-dashed ${theme.cardBorder} shadow-none ${theme.cardBg} rounded-2xl`}>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <ShieldCheck className="mb-4 h-12 w-12 opacity-40" />
                            <p className="text-base font-bold">No blotter records found.</p>
                            <p className={`text-xs ${theme.textMuted} mt-1`}>You have not filed any formal dispute records or incident complaints.</p>
                        </CardContent>
                    </Card>
                ) : (
                    blotters.map((blotter) => (
                        <Card key={blotter.id} className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl transition-all hover:shadow-md hover:border-blue-300`}>
                            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-base font-extrabold font-mono">{blotter.ticket_number ?? 'Pending Intake Review'}</h3>
                                        <Badge 
                                            variant={blotter.status === 'pending_approval' ? 'warning' : 'success'}
                                            className="uppercase tracking-wider text-[10px] font-black"
                                        >
                                            {blotter.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <p className={`text-xs ${theme.textMuted} font-medium`}>Filed on: {blotter.created_at} · Type: <span className="capitalize font-bold">{blotter.type}</span></p>
                                </div>
                                <Button size="sm" variant="outline" className="text-xs font-bold text-blue-700 hover:bg-blue-50 border-blue-200 cursor-pointer shadow-2xs shrink-0" asChild>
                                    <Link href={`/blotters/${blotter.id}`}>
                                        View Case Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </ResidentLayout>
    );
}