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
        <ResidentLayout wide>
            <Head title="My Blotter Records" />
            
            <div className="w-full space-y-6 pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageHeader 
                        title="My Blotter Records" 
                        description="Track active mediation cases, ticket numbers, and formal incident logs." 
                    />
                    <Button asChild className={`w-full sm:w-auto ${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs shadow-sm cursor-pointer rounded-2xl h-11 px-5`}>
                        <Link href={route('blotter.create')}>
                            <Plus className="mr-2 h-4 w-4" /> File New Blotter
                        </Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {blotters.length === 0 ? (
                        <Card className={`border-dashed ${theme.cardBorder} shadow-none ${theme.cardBg} rounded-3xl`}>
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <ShieldCheck className={`mb-4 h-14 w-14 ${theme.textMuted} opacity-40`} />
                                <p className={`text-base font-black ${theme.textMain}`}>No blotter records found.</p>
                                <p className={`text-xs ${theme.textMuted} mt-1 font-medium`}>You have not filed any formal dispute records or incident complaints.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        blotters.map((blotter) => (
                            <Card key={blotter.id} className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl transition-all hover:shadow-md hover:border-blue-400`}>
                                <CardContent className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <FileText className={`h-5 w-5 ${theme.primaryText} shrink-0`} />
                                            <h3 className={`text-base font-black font-mono ${theme.textMain}`}>{blotter.ticket_number ?? 'Pending Intake Review'}</h3>
                                            <Badge 
                                                variant={blotter.status === 'pending_approval' ? 'warning' : 'success'}
                                                className="uppercase tracking-wider text-[10px] font-black px-3 py-1 rounded-xl"
                                            >
                                                {blotter.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className={`text-xs ${theme.textMuted} font-medium`}>Filed on: {blotter.created_at} · Type: <span className="capitalize font-bold">{blotter.type}</span></p>
                                    </div>
                                    <Button size="sm" variant="outline" className={`text-xs font-black ${theme.primaryText} hover:opacity-90 ${theme.cardBorder} cursor-pointer shadow-2xs shrink-0 rounded-xl h-10 px-4`} asChild>
                                        <Link href={`/blotters/${blotter.id}`}>
                                            View Case Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </ResidentLayout>
    );
}