import { Head, Link } from '@inertiajs/react';
import { MapPin, ArrowLeft, Heart, MessageCircle } from 'lucide-react';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import StatusTimeline from '@/Components/resident/StatusTimeline';
import PageHeader from '@/Components/shared/PageHeader';
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

export default function Show({ concern }: ConcernShowPageProps) {
    return (
        <ResidentLayout wide>
            <Head title={concern.title} />

            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 py-2 space-y-4">
                <Button variant="ghost" className="h-8 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2 -ml-1" asChild>
                    <Link href="/feed">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Feed
                    </Link>
                </Button>

                <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                    <PageHeader
                        title={concern.title}
                        description={concern.category}
                    />
                    <Badge variant={severityVariant[concern.severity]} className="rounded-md font-black text-[10px] uppercase px-2 py-0.5 shadow-none shrink-0 h-fit">
                        {concern.severity}
                    </Badge>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 text-xs font-bold text-neutral-700 items-start">
                    {/* Left Details Block Column */}
                    <div className="lg:col-span-2 space-y-4 w-full">
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-neutral-100/70 px-4 py-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Description</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <p className="text-xs font-medium text-neutral-600 leading-relaxed whitespace-pre-wrap">{concern.description}</p>
                                <div className="pt-2.5 border-t border-neutral-100 flex items-center gap-1.5 text-neutral-500 font-medium">
                                    <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                    <span>{concern.location_label}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-4 space-y-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950 px-0.5">Map Context Pin</CardTitle>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/70">
                                <MapView
                                    center={[concern.lat, concern.lng]}
                                    pins={[{ id: concern.id, lat: concern.lat, lng: concern.lng, title: concern.title }]}
                                    className="h-48 sm:h-56"
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right Side Widgets Column */}
                    <div className="space-y-4 w-full">
                        {/* Vote Action Sidebar Block */}
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4 space-y-2.5">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Community Vote</CardTitle>
                            <ConcernVoteButtons
                                concernId={concern.id}
                                voteCount={concern.vote_count}
                                userVote={concern.user_vote ?? null}
                            />
                            <p className="text-[10px] font-medium text-neutral-400 leading-normal pt-1 border-t border-neutral-100">
                                Upvote reported logs you wish to prioritize for barangay action. Downvote if you believe the entry metrics are inaccurate.
                            </p>
                        </Card>

                        {/* Timeline Status Sidebar Block */}
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4">
                            <CardHeader className="p-0 pb-3 border-b border-neutral-100 mb-3">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Operational Status</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <StatusTimeline steps={concern.timeline} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </ResidentLayout>
    );
}