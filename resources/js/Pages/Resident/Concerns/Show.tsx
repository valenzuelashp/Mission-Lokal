import { Head, Link } from '@inertiajs/react';
import { MapPin } from 'lucide-react';
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
        <ResidentLayout>
            <Head title={concern.title} />
            <PageHeader
                title={concern.title}
                description={concern.category}
                action={<Badge variant={severityVariant[concern.severity]}>{concern.severity}</Badge>}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed text-muted-foreground">{concern.description}</p>
                            {concern.images && concern.images.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto">
                                    {concern.images.map((url: string, idx: number) => (
                                        <img 
                                            key={idx} 
                                            src={url} 
                                            alt="Concern Photo" 
                                            className="h-32 w-32 shrink-0 rounded-lg border border-slate-200 object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                            {/* --- WORKER RESOLUTION PROOF --- */}
                            {concern.proof_notes && (
                                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                                    <h3 className="font-semibold text-emerald-900">Resolution update</h3>
                                    <p className="mt-1 text-sm text-emerald-800">{concern.proof_notes}</p>
                                    
                                    {concern.proof_photos && concern.proof_photos.length > 0 && (
                                        <div className="mt-3 flex gap-2 overflow-x-auto">
                                            {concern.proof_photos.map((url: string, idx: number) => (
                                                <img 
                                                    key={idx} 
                                                    src={url} 
                                                    alt="Resolution Proof" 
                                                    className="h-32 w-32 shrink-0 rounded-md border border-emerald-200 object-cover"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {concern.location_label}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Map</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MapView
                                center={[concern.lat, concern.lng]}
                                pins={[{ id: concern.id, lat: concern.lat, lng: concern.lng, title: concern.title }]}
                                className="h-56 sm:h-64"
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-base">Community vote</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                    <ConcernVoteButtons
                            concernId={concern.id}
                            upvotes={concern.upvotes}
                            downvotes={concern.downvotes}
                            userVote={concern.user_vote ?? null}
                        />
                        <p className="text-xs text-muted-foreground">
                            Upvote concerns you want prioritized. Downvote if you think the issue is inaccurate or
                            already resolved.
                        </p>
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-base">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatusTimeline steps={concern.timeline} />
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Button variant="outline" asChild>
                    <Link href="/feed">Back to feed</Link>
                </Button>
            </div>
        </ResidentLayout>
    );
}
