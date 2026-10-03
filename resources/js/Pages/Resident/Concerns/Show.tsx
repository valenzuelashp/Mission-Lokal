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

    return (
        <ResidentLayout>
            <Head title={concern.title} />

            <div className="mb-4">
                <Button variant="ghost" className={`text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                    <Link href="/feed">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to Community Feed
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-7">
                    <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl overflow-hidden`}>
                        <CardContent className="p-5 space-y-4">
                            <div className={`flex items-center justify-between pb-4 border-b ${theme.dividerColor}`}>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs">
                                        {firstInitial}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{reporterName}</p>
                                        <p className="text-xs font-black uppercase tracking-wider text-blue-600 mt-0.5">{concern.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={severityVariant[concern.severity]} className="font-bold">{severityLabel[concern.severity]}</Badge>
                                    <span className={`text-xs font-bold ${theme.textMuted} bg-slate-100/60 px-3 py-1 rounded-full border ${theme.cardBorder}`}>
                                        Public View
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-xl font-black break-words tracking-tight">{concern.title}</h1>
                                <div className={`mt-2.5 flex flex-wrap items-center gap-4 text-xs ${theme.textMuted} font-medium`}>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                                        <span>Posted {concern.created_at}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                        <span className="truncate">{concern.location_label}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`pt-2 border-t ${theme.dividerColor}`}>
                                <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted} mb-1.5`}>Description</h3>
                                <p className={`text-sm leading-relaxed font-medium whitespace-pre-wrap ${theme.inputBg} p-4 rounded-xl border ${theme.cardBorder}`}>{concern.description}</p>
                            </div>

                            {concern.images && concern.images.length > 0 && (
                                <div>
                                    <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMuted} mb-2`}>Evidence Photos</h3>
                                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                                        {concern.images.map((url: string, idx: number) => (
                                            <BufferedImage
                                                key={idx}
                                                src={url}
                                                alt="Concern photo"
                                                className={`h-28 w-28 shrink-0 rounded-xl border ${theme.cardBorder} shadow-2xs`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {concern.proof_notes && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">Official Municipal Resolution Update</h3>
                                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">{concern.proof_notes}</p>
                                    
                                    {concern.proof_photos && concern.proof_photos.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pt-2">
                                            {concern.proof_photos.map((url: string, idx: number) => (
                                                <BufferedImage
                                                    key={idx}
                                                    src={url}
                                                    alt="Proof"
                                                    className="h-20 w-20 shrink-0 rounded-xl border border-emerald-200 shadow-2xs"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl overflow-hidden`}>
                        <CardHeader className={`py-3 px-5 border-b ${theme.dividerColor}`}>
                            <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Pinpointed Map Location</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <MapView
                                center={[concern.lat, concern.lng]}
                                pins={[{ id: concern.id, lat: concern.lat, lng: concern.lng, title: concern.title, severity: concern.severity }]}
                                className="h-44 rounded-xl overflow-hidden border border-slate-200"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4 lg:col-span-5">
                    <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <span className={`text-xs font-black uppercase tracking-wider ${theme.textMuted} bg-slate-100/50 px-3 py-1 rounded-full border ${theme.cardBorder}`}>
                                {concern.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-black uppercase tracking-wider text-white bg-blue-700 px-3 py-1 rounded-full shadow-2xs">
                                Active Queue
                            </span>
                        </CardContent>
                    </Card>

                    <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl`}>
                        <CardHeader className={`py-3.5 px-5 border-b ${theme.dividerColor}`}>
                            <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Community Vote</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-2">
                            <ConcernVoteButtons
                                concernId={concern.id}
                                upvotes={concern.upvotes}
                                downvotes={concern.downvotes}
                                userVote={concern.user_vote ?? null}
                                compact
                            />
                            <p className={`text-[11px] ${theme.textMuted} font-medium leading-tight`}>
                                Upvotes help barangay commanders prioritize urgent infrastructural triage.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl`}>
                        <CardHeader className={`py-3.5 px-5 border-b ${theme.dividerColor}`}>
                            <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>Lifecycle Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <StatusTimeline steps={concern.timeline} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ResidentLayout>
    );
}