import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import StatusTimeline from '@/Components/resident/StatusTimeline';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import MapView from '@/Components/maps/MapView';
import ResidentLayout from '@/Layouts/ResidentLayout';
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
    const reporterName = concern.reporter_name ?? 'Verified Resident';
    const firstInitial = reporterName.charAt(0).toUpperCase();

    return (
        <ResidentLayout>
            <Head title={concern.title} />

            {/* Top Navigation & Back Button */}
            <div className="mb-3 flex items-center justify-between">
                <Button variant="ghost" className="-ml-2 h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/feed">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back to feed
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Badge variant={severityVariant[concern.severity]}>{severityLabel[concern.severity]}</Badge>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                        Public View
                    </span>
                </div>
            </div>

            {/* Ultra-Compact 2-Column Dashboard Grid */}
            <div className="grid gap-4 lg:grid-cols-12">
                
                {/* LEFT COLUMN: Feed Author Header, Title, Description, Photos & Map (7 Cols) */}
                <div className="space-y-3 lg:col-span-7">
                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardContent className="p-4 space-y-3">
                            {/* Author Header Info */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        {firstInitial}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{reporterName}</p>
                                        <p className="text-xs font-semibold text-muted-foreground">{concern.category}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Title & Meta */}
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 break-words">{concern.title}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-600">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Posted on: {concern.created_at}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-medium text-slate-600 truncate max-w-[240px]">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        <span className="truncate">Location: {concern.location_label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="pt-2 border-t border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Description</h3>
                                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{concern.description}</p>
                            </div>

                            {/* Attached Photos */}
                            {concern.images && concern.images.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Attached Photos</h3>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {concern.images.map((url: string, idx: number) => (
                                            <img 
                                                key={idx} 
                                                src={url} 
                                                alt="Concern Photo" 
                                                className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover shadow-2xs"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Worker Resolution Proof */}
                            {concern.proof_notes && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 space-y-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Resolution Update</h3>
                                    <p className="text-xs text-emerald-800 leading-relaxed">{concern.proof_notes}</p>
                                    
                                    {concern.proof_photos && concern.proof_photos.length > 0 && (
                                        <div className="flex gap-1.5 overflow-x-auto">
                                            {concern.proof_photos.map((url: string, idx: number) => (
                                                <img 
                                                    key={idx} 
                                                    src={url} 
                                                    alt="Proof" 
                                                    className="h-20 w-20 shrink-0 rounded border border-emerald-200 object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mini Map */}
                    <Card className="border-slate-200/80 shadow-2xs overflow-hidden">
                        <CardHeader className="py-2.5 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pinpointed Map</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <MapView
                                center={[concern.lat, concern.lng]}
                                pins={[{ id: concern.id, lat: concern.lat, lng: concern.lng, title: concern.title, severity: concern.severity }]}
                                className="h-40 rounded-md"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Status Bar, Voting & Timeline (5 Cols) */}
                <div className="space-y-3 lg:col-span-5">
                    {/* Status & Active Queue Badges Bar */}
                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardContent className="p-3.5 flex items-center justify-between">
                            <span className="text-xs font-semibold capitalize text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
                                {concern.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full shadow-2xs">
                                Active Queue
                            </span>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Community Vote</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <ConcernVoteButtons
                                concernId={concern.id}
                                upvotes={concern.upvotes}
                                downvotes={concern.downvotes}
                                userVote={concern.user_vote ?? null}
                                compact
                            />
                            <p className="text-[11px] text-muted-foreground leading-tight">
                                Upvote to prioritize; downvote if inaccurate.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/80 shadow-2xs">
                        <CardHeader className="py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <StatusTimeline steps={concern.timeline} />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </ResidentLayout>
    );
}