import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, User } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';

type ResidentBlotterDetail = {
    id: string;
    ticket_number: string;
    type: string;
    respondent_name?: string | null;
    narrative: string;
    incident_date: string;
    incident_address: string;
    relief_sought?: string | null;
    witnesses: string[];
    status: string;
    created_at: string;
};

export default function Show({ blotter }: { blotter: ResidentBlotterDetail }) {
    const theme = useResidentTheme();
    const statusLabel = blotter.status.replaceAll('_', ' ');

    return (
        <ResidentLayout wide>
            <Head title={`Blotter ${blotter.ticket_number}`} />

            <div className="w-full space-y-6 pb-8 pt-8 sm:pt-10">
                <Button variant="ghost" className={`h-auto p-0 text-xs font-bold ${theme.textMuted}`} asChild>
                    <Link href="/blotters">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to my blotter records
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className={`text-[11px] font-black uppercase tracking-wider ${theme.primaryText}`}>Filed blotter</p>
                        <h1 className={`mt-1 font-mono text-2xl font-black sm:text-3xl ${theme.textMain}`}>{blotter.ticket_number}</h1>
                        <p className={`mt-1 text-xs font-medium ${theme.textMuted}`}>Filed {blotter.created_at} · {blotter.type}</p>
                    </div>
                    <Badge variant={blotter.status === 'pending_approval' ? 'warning' : 'success'} className="uppercase tracking-wider text-[10px] font-black">
                        {statusLabel}
                    </Badge>
                </div>

                <div className="grid gap-4 lg:grid-cols-12">
                    <Card className={`shadow-2xs lg:col-span-8 ${theme.cardBorder} ${theme.cardBg} rounded-3xl`}>
                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <div>
                                <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Statement of facts</h2>
                                <p className={`mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-relaxed ${theme.cardBorder} ${theme.textMain}`}>{blotter.narrative}</p>
                            </div>
                            <div>
                                <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Relief sought</h2>
                                <p className={`mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-relaxed ${theme.cardBorder} ${theme.textMain}`}>{blotter.relief_sought || 'No specific relief stated.'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`shadow-2xs lg:col-span-4 ${theme.cardBorder} ${theme.cardBg} rounded-3xl`}>
                        <CardContent className="space-y-4 p-6">
                            <div className="flex items-start gap-2">
                                <User className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                                <div>
                                    <p className={`text-[11px] font-black uppercase tracking-wider ${theme.textMuted}`}>Other party</p>
                                    <p className={`text-sm font-bold ${theme.textMain}`}>{blotter.respondent_name || 'Not named'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                                <div>
                                    <p className={`text-[11px] font-black uppercase tracking-wider ${theme.textMuted}`}>Incident</p>
                                    <p className={`text-sm font-bold ${theme.textMain}`}>{blotter.incident_date}</p>
                                    <p className={`mt-1 text-xs ${theme.textMuted}`}>{blotter.incident_address}</p>
                                </div>
                            </div>
                            {blotter.witnesses.length > 0 && (
                                <div>
                                    <p className={`text-[11px] font-black uppercase tracking-wider ${theme.textMuted}`}>Witnesses</p>
                                    <ul className={`mt-2 space-y-1 text-sm font-medium ${theme.textMain}`}>
                                        {blotter.witnesses.map((witness) => (
                                            <li key={witness}>{witness}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ResidentLayout>
    );
}
