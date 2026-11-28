import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { AlertCircle, ArrowLeft, FileText, Plus, ShieldCheck, ChevronRight } from 'lucide-react';
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

type ResidentConcern = {
    id: string;
    title: string;
    status: string;
    created_at: string;
    has_pending_clarification: boolean;
};

type RecordsTab = 'concerns' | 'blotters';

export default function Index({ blotters, concerns = [] }: { blotters: ResidentBlotter[]; concerns?: ResidentConcern[] }) {
    const theme = useResidentTheme();
    const [activeTab, setActiveTab] = useState<RecordsTab>('concerns');
    const pendingQuestions = concerns.filter((concern) => concern.has_pending_clarification).length;

    return (
        <ResidentLayout wide>
            <Head title="My Records" />
            
            <div className="w-full space-y-6 pb-2 pt-8 sm:pt-10">
                <Button asChild variant="outline" className={`rounded-xl ${theme.cardBorder} ${theme.textMain}`}>
                    <Link href="/feed">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to community feed
                    </Link>
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageHeader 
                        title="My Records"
                        description="Keep track of your community concerns and formal blotter cases."
                    />
                    {activeTab === 'blotters' ? (
                        <Button asChild className={`w-full sm:w-auto ${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs shadow-sm cursor-pointer rounded-2xl h-11 px-5`}>
                            <Link href={route('blotter.create')}>
                                <Plus className="mr-2 h-4 w-4" /> File New Blotter
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild className={`w-full sm:w-auto ${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs shadow-sm cursor-pointer rounded-2xl h-11 px-5`}>
                            <Link href="/feed">
                                <Plus className="mr-2 h-4 w-4" /> Post a Concern
                            </Link>
                        </Button>
                    )}
                </div>

                <div role="tablist" aria-label="My record types" className={`grid grid-cols-2 gap-2 rounded-2xl border p-2 ${theme.cardBorder} ${theme.cardBg}`}>
                    {([
                        { id: 'concerns' as const, label: 'My Concerns', count: concerns.length },
                        { id: 'blotters' as const, label: 'My Blotter Cases', count: blotters.length },
                    ]).map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            id={`my-records-tab-${tab.id}`}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex min-h-11 flex-wrap items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-colors ${activeTab === tab.id ? `${theme.primaryBg} text-white` : `${theme.textMuted} ${theme.hoverBg}`}`}
                        >
                            <span>{tab.label}</span>
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${activeTab === tab.id ? 'bg-white/20 text-white' : theme.accentSurface}`}>{tab.count}</span>
                            {tab.id === 'concerns' && pendingQuestions > 0 && (
                                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${activeTab === tab.id ? 'bg-amber-300 text-amber-950' : 'bg-amber-100 text-amber-900'}`}>
                                    {pendingQuestions} needs reply
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div id="my-records-panel" role="tabpanel" aria-labelledby={`my-records-tab-${activeTab}`} tabIndex={0} className="space-y-4">
                    {activeTab === 'concerns' && concerns.length === 0 ? (
                        <Card className={`border-dashed ${theme.cardBorder} shadow-none ${theme.cardBg} rounded-3xl`}>
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <FileText className={`mb-4 h-14 w-14 ${theme.textMuted} opacity-40`} />
                                <p className={`text-base font-black ${theme.textMain}`}>No concerns filed yet.</p>
                                <p className={`text-xs ${theme.textMuted} mt-1 font-medium`}>Concerns you post will appear here, including any requests for more details from staff.</p>
                                <Button asChild className={`mt-5 ${theme.primaryBg} ${theme.primaryHover} text-white`}>
                                    <Link href="/feed">Go to community feed</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : activeTab === 'concerns' ? (
                        concerns.map((concern) => (
                            <Card key={concern.id} className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} ${theme.cardHoverBorder} rounded-3xl transition-all hover:shadow-md`}>
                                <CardContent className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className={`text-base font-black ${theme.textMain}`}>{concern.title}</h3>
                                            <Badge variant="outline" className="capitalize">{concern.status.replaceAll('_', ' ')}</Badge>
                                        </div>
                                        <p className={`text-xs ${theme.textMuted} font-medium`}>Posted {concern.created_at}</p>
                                        {concern.has_pending_clarification && (
                                            <p className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950">
                                                <AlertCircle className="h-4 w-4 shrink-0" />
                                                Staff requested more details — your reply is needed
                                            </p>
                                        )}
                                    </div>
                                    <Button size="sm" variant="outline" className={`text-xs font-black ${theme.primaryText} hover:opacity-90 ${theme.cardBorder} cursor-pointer shadow-2xs shrink-0 rounded-xl h-10 px-4`} asChild>
                                        <Link href={`/concerns/${concern.id}${concern.has_pending_clarification ? '#concern-clarifications' : ''}`}>
                                            {concern.has_pending_clarification ? 'Review questions' : 'View concern'} <ChevronRight className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : blotters.length === 0 ? (
                        <Card className={`border-dashed ${theme.cardBorder} shadow-none ${theme.cardBg} rounded-3xl`}>
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <ShieldCheck className={`mb-4 h-14 w-14 ${theme.textMuted} opacity-40`} />
                                <p className={`text-base font-black ${theme.textMain}`}>No blotter records found.</p>
                                <p className={`text-xs ${theme.textMuted} mt-1 font-medium`}>You have not filed any formal dispute records or incident complaints.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        blotters.map((blotter) => (
                            <Card key={blotter.id} className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} ${theme.cardHoverBorder} rounded-3xl transition-all hover:shadow-md`}>
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