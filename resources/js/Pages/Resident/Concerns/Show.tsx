import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import BufferedImage from '@/Components/shared/BufferedImage';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import StatusTimeline from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import MapView from '@/Components/maps/MapView';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { ConcernShowPageProps, Severity } from '@/Types';

const severityVariant: Record<Severity, 'success' | 'secondary' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'secondary',
    high: 'warning',
    critical: 'danger',
};

const severityLabel: Record<Severity, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
};

type Props = ConcernShowPageProps & {
    concern: ConcernShowPageProps['concern'] & { reporter_name?: string };
};

export default function Show({ concern }: Props) {
    const theme = useResidentTheme();
    const reporterName = concern.reporter_name ?? 'Verified Resident';
    const firstInitial = reporterName.charAt(0).toUpperCase();

    const isPendingReview = ['submitted', 'ai_processed'].includes(concern.status);

    return (
        <ResidentLayout wide>
            <Head title={concern.title} />

            <div className="w-full space-y-6 pb-16">
                <div className="mb-2">
                    <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                        <Link href="/feed">
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                            Back to Community Feed
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    <div className="space-y-6 lg:col-span-7">
                        <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-2xs rounded-3xl overflow-hidden`}>
                            <CardContent className="p-6 sm:p-8 space-y-6">
                                <div className={`flex items-center justify-between pb-5 border-b ${theme.dividerColor}`}>
                                    <div className="flex items-center gap-3.5">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} font-black border shadow-2xs`}>
                                            {firstInitial}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-black ${theme.textMain}`}>{reporterName}</p>
                                            <p className={`text-xs font-black uppercase tracking-wider ${theme.primaryText} mt-0.5`}>{concern.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Badge variant={severityVariant[concern.severity]} className="font-black px-3 py-1 rounded-xl">{severityLabel[concern.severity]}</Badge>
                                        <span className={`text-xs font-bold ${theme.textMuted} bg-slate-100/70 px-3.5 py-1 rounded-xl border ${theme.cardBorder}`}>
                                            Public View
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h1 className={`text-2xl font-black break-words tracking-tight ${theme.textMain}`}>{concern.title}</h1>
                                    <div className={`mt-3 flex flex-wrap items-center gap-5 text-xs ${theme.textMuted} font-semibold`}>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 opacity-60" />
                                            <span>Posted {concern.created_at}</span>
                                        </div>
                                        <div className="flex items-center gap-2 truncate max-w-[280px]">
                                            <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                                            <span className="truncate">{concern.location_label}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`pt-4 border-t ${theme.dividerColor}`}>
                                    <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted} mb-2`}>Description</h3>
                                    <p className={`text-sm leading-relaxed font-medium whitespace-pre-wrap ${theme.inputBg} p-5 rounded-2xl border ${theme.cardBorder} ${theme.textMain}`}>{concern.description}</p>
                                </div>

                                {concern.images && concern.images.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Evidence Photos</h3>
                                        <div className="flex gap-3 overflow-x-auto pb-1">
                                            {concern.images.map((url: string, idx: number) => (
                                                <BufferedImage
                                                    key={idx}
                                                    src={url}
                                                    alt="Concern photo"
                                                    className={`h-32 w-32 shrink-0 rounded-2xl border ${theme.cardBorder} shadow-2xs`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {concern.proof_notes && (
                                    <div className={`rounded-2xl border ${theme.badgeBorder} ${theme.badgeBg} p-5 space-y-3 shadow-2xs`}>
                                        <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Official Municipal Resolution Update</h3>
                                        <p className={`text-xs ${theme.textMain} leading-relaxed font-medium`}>{concern.proof_notes}</p>
                                        
                                        {concern.proof_photos && concern.proof_photos.length > 0 && (
                                            <div className="flex gap-3 overflow-x-auto pt-2">
                                                {concern.proof_photos.map((url: string, idx: number) => (
                                                    <BufferedImage
                                                        key={idx}
                                                        src={url}
                                                        alt="Proof"
                                                        className={`h-24 w-24 shrink-0 rounded-xl border ${theme.badgeBorder} shadow-2xs`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-2xs rounded-3xl overflow-hidden`}>
                            <CardHeader className={`py-4 px-6 border-b ${theme.dividerColor}`}>
                                <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Pinpointed Map Location</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <MapView
                                    center={[concern.lat, concern.lng]}
                                    pins={[{ id: concern.id, lat: concern.lat, lng: concern.lng, title: concern.title, severity: concern.severity }]}
                                    className="h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6 lg:col-span-5">
                        <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-2xs rounded-3xl overflow-hidden`}>
                            <CardContent className="p-5 flex items-center justify-between font-black text-xs">
                                <span className={`${theme.textMuted} bg-slate-100/70 px-3.5 py-1.5 rounded-xl border ${theme.cardBorder}`}>
                                    {concern.status.replace('_', ' ')}
                                </span>
                                <span className={`text-white ${theme.primaryBg} px-4 py-1.5 rounded-xl shadow-2xs uppercase tracking-wider`}>
                                    Active Queue
                                </span>
                            </CardContent>
                        </Card>

                        <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-2xs rounded-3xl overflow-hidden`}>
                            <CardHeader className={`py-4 px-6 border-b ${theme.dividerColor}`}>
                                <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Community Vote</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-3">
                                <ConcernVoteButtons
                                    concernId={concern.id}
                                    upvotes={concern.upvotes}
                                    downvotes={concern.downvotes}
                                    userVote={concern.user_vote ?? null}
                                    compact
                                />
                                <p className={`text-[11px] ${theme.textMuted} font-semibold leading-relaxed pt-1`}>
                                    Upvotes help barangay commanders prioritize urgent infrastructural triage.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Timeline & Updates card is ONLY visible if the concern has been reviewed and has official updates */}
                        {!isPendingReview && concern.timeline && concern.timeline.length > 0 && (
                            <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-2xs rounded-3xl overflow-hidden`}>
                                <CardHeader className={`py-4 px-6 border-b ${theme.dividerColor}`}>
                                    <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Barangay Updates</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <StatusTimeline steps={concern.timeline} />
                                    {(concern.response_plan?.prescriptive_steps?.length > 0
                                        || concern.response_plan?.estimated_duration
                                        || concern.response_plan?.estimated_completion) && (
                                        <div className={`mt-6 border-t ${theme.dividerColor} pt-5`}>
                                            <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>
                                                AI-suggested response plan
                                            </h3>
                                            {concern.response_plan.prescriptive_steps.length > 0 && (
                                                <ol className={`mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed ${theme.textMuted}`}>
                                                    {concern.response_plan.prescriptive_steps.map((step: string, index: number) => (
                                                        <li key={`${index}-${step}`}>{step}</li>
                                                    ))}
                                                </ol>
                                            )}
                                            {(concern.response_plan.estimated_duration || concern.response_plan.estimated_completion) && (
                                                <p className={`mt-3 text-[11px] font-semibold ${theme.textMuted}`}>
                                                    {concern.response_plan.estimated_duration
                                                        && `Estimated duration: ${concern.response_plan.estimated_duration}`}
                                                    {concern.response_plan.estimated_duration && concern.response_plan.estimated_completion && ' · '}
                                                    {concern.response_plan.estimated_completion
                                                        && `Target completion: ${concern.response_plan.estimated_completion}`}
                                                    <span className="block">Estimate only; actual timing may vary.</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </ResidentLayout>
    );
}