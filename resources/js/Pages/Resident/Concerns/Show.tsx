import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import BufferedImage from '@/Components/shared/BufferedImage';
import ConcernPhotoGallery from '@/Components/resident/ConcernPhotoGallery';
import UserAvatar from '@/Components/shared/UserAvatar';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import StatusTimeline from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import MapView from '@/Components/maps/MapView';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
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
    concern: ConcernShowPageProps['concern'] & { reporter_name?: string; reporter_photo_url?: string | null };
};

export default function Show({ concern }: Props) {
    const theme = useResidentTheme();
    const reporterName = concern.reporter_name ?? 'Verified Resident';

    const isPendingReview = ['submitted', 'ai_processed'].includes(concern.status);
    const rightAside = (
        <div className="space-y-5">
            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-4 p-5">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Report status</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={severityVariant[concern.severity]}>{severityLabel[concern.severity]} severity</Badge>
                        <Badge variant="outline" className={`capitalize ${theme.badgeBorder} ${theme.textMain}`}>
                            {concern.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <div className={`space-y-3 border-t pt-4 ${theme.dividerColor}`}>
                        <div className="flex items-start gap-3">
                            <Calendar className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Reported</p>
                                <p className={`mt-0.5 text-xs font-bold ${theme.textMain}`}>{concern.created_at}</p>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-start gap-3">
                            <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                            <div className="min-w-0">
                                <p className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Location</p>
                                <p className={`mt-0.5 break-words text-xs font-bold ${theme.textMain}`}>{concern.location_label}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardHeader className={`border-b px-5 py-4 ${theme.dividerColor}`}>
                    <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Community support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-5">
                    <ConcernVoteButtons
                        concernId={concern.id}
                        upvotes={concern.upvotes}
                        downvotes={concern.downvotes}
                        userVote={concern.user_vote ?? null}
                        compact
                    />
                    <p className={`text-[11px] ${theme.textMuted} font-semibold leading-relaxed`}>
                        Upvotes help barangay commanders prioritize urgent infrastructural triage.
                    </p>
                </CardContent>
            </Card>

            {!isPendingReview && concern.timeline && concern.timeline.length > 0 && (
                <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                    <CardHeader className={`border-b px-5 py-4 ${theme.dividerColor}`}>
                        <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Official updates</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <StatusTimeline steps={concern.timeline} />
                        {(concern.response_plan?.prescriptive_steps?.length > 0
                            || concern.response_plan?.estimated_duration
                            || concern.response_plan?.estimated_completion) && (
                            <div className={`mt-5 border-t pt-4 ${theme.dividerColor}`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-wider ${theme.textMain}`}>
                                    Response plan
                                </h3>
                                {concern.response_plan.prescriptive_steps.length > 0 && (
                                    <ol className={`mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed ${theme.textMuted}`}>
                                        {concern.response_plan.prescriptive_steps.map((step: string, index: number) => (
                                            <li key={`${index}-${step}`}>{step}</li>
                                        ))}
                                    </ol>
                                )}
                                {(concern.response_plan.estimated_duration || concern.response_plan.estimated_completion) && (
                                    <p className={`mt-3 text-[10px] font-semibold leading-relaxed ${theme.textMuted}`}>
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
    );

    return (
        <ResidentLayout wide>
            <Head title={concern.title} />

            <ResidentSocialShell right={rightAside}>
                <div className="w-full space-y-5 pb-2">
                    <div>
                        <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                            <Link href="/feed">
                                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                                Back to Community Feed
                            </Link>
                        </Button>
                    </div>

                    <article className={`overflow-hidden rounded-3xl border shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                        <header className={`space-y-5 border-b p-5 sm:p-7 ${theme.dividerColor}`}>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <UserAvatar
                                        src={concern.reporter_photo_url}
                                        name={reporterName}
                                        className={`h-11 w-11 shrink-0 rounded-2xl border font-black shadow-2xs ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                                    />
                                    <div className="min-w-0">
                                        <p className={`truncate text-sm font-black ${theme.textMain}`}>{reporterName}</p>
                                        <p className={`mt-0.5 text-[10px] font-black uppercase tracking-wider ${theme.primaryText}`}>{concern.category}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`gap-1.5 ${theme.cardBorder} ${theme.textMuted}`}>
                                    Public report
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={severityVariant[concern.severity]}>{severityLabel[concern.severity]} severity</Badge>
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black capitalize ${theme.cardBorder} ${theme.accentSurface} ${theme.textMain}`}>
                                        {concern.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <h1 className={`break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl ${theme.textMain}`}>{concern.title}</h1>
                                <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold ${theme.textMuted}`}>
                                    <span className="inline-flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />Reported {concern.created_at}</span>
                                    <span className="inline-flex min-w-0 items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="break-words">{concern.location_label}</span></span>
                                </div>
                            </div>
                        </header>

                        <div className="space-y-6 p-5 sm:p-7">
                            <section className="space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <h2 className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Reported location</h2>
                                        <p className={`mt-1 text-xs font-bold ${theme.textMain}`}>{concern.location_label}</p>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                                        Venue · Tambo
                                    </span>
                                </div>
                                <MapView
                                    center={[concern.lat, concern.lng]}
                                    pins={[{ id: concern.id, lat: concern.lat, lng: concern.lng, title: concern.title, severity: concern.severity }]}
                                    className={`h-64 overflow-hidden rounded-2xl border ${theme.cardBorder} shadow-2xs`}
                                />
                            </section>

                            <section>
                                <h2 className={`mb-2 text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>What happened</h2>
                                <p className={`whitespace-pre-wrap rounded-2xl border p-4 text-sm font-medium leading-relaxed sm:p-5 ${theme.cardBorder} ${theme.inputBg} ${theme.textMain}`}>
                                    {concern.description}
                                </p>
                            </section>

                            {concern.images && concern.images.length > 0 && (
                                <section className="space-y-3">
                                    <h2 className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Evidence photos</h2>
                                    <ConcernPhotoGallery images={concern.images} title={concern.title} />
                                </section>
                            )}

                            {concern.proof_notes && (
                                <section className={`space-y-3 rounded-2xl border p-5 shadow-2xs ${theme.badgeBorder} ${theme.badgeBg}`}>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>Barangay response</p>
                                        <h2 className={`mt-1 text-sm font-black ${theme.textMain}`}>Official municipal resolution update</h2>
                                    </div>
                                    <p className={`whitespace-pre-wrap text-xs font-medium leading-relaxed ${theme.textMain}`}>{concern.proof_notes}</p>
                                    {concern.proof_photos && concern.proof_photos.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
                                            {concern.proof_photos.map((url: string, idx: number) => (
                                                <BufferedImage
                                                    key={idx}
                                                    src={url}
                                                    alt={`Resolution evidence ${idx + 1}`}
                                                    className={`aspect-square w-full rounded-xl border ${theme.badgeBorder}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                </article>
                    </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}