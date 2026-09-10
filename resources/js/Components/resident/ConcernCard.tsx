import { Link } from '@inertiajs/react';
import { MapPin, MessageCircle, Calendar } from 'lucide-react';
import BufferedImage from '@/Components/shared/BufferedImage';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { PublicConcern, Severity } from '@/Types';

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

type Props = {
    concern: PublicConcern & { reporter_name?: string };
};

export default function ConcernCard({ concern }: Props) {
    return (
        <article className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
            {/* Top Author / Header Meta */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {concern.reporter_name ? concern.reporter_name.charAt(0) : 'ML'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">{concern.reporter_name ?? 'Verified Resident'}</p>
                        <p className="text-xs font-semibold text-muted-foreground">{concern.category}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={severityVariant[concern.severity]}>{severityLabel[concern.severity]}</Badge>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                        Public View
                    </span>
                </div>
            </div>

            {/* Title & Location / Date Row */}
            <div className="px-4 py-2">
                <Link href={`/concerns/${concern.id}`} className="block break-words text-lg font-bold text-slate-900 hover:text-primary transition-colors">
                    {concern.title}
                </Link>
                
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

            {/* Main Media Image Container */}
            {concern.images && concern.images.length > 0 && (
                <div className="mt-3 bg-slate-1000 overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto p-2">
                        {concern.images.map((url: string, idx: number) => (
                            <BufferedImage
                                key={idx}
                                src={url}
                                alt="Concern attachment"
                                className="h-64 w-full rounded-lg shadow-sm"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Status & Vote / Schedule Bar */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                <ConcernVoteButtons
                    concernId={concern.id}
                    upvotes={concern.upvotes}
                    downvotes={concern.downvotes}
                    userVote={concern.user_vote ?? null}
                    compact
                />
                
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold capitalize text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                        {concern.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-white bg-primary px-3 py-1 rounded-full shadow-2xs">
                        Active Queue
                    </span>
                </div>
            </div>

            {/* Bottom Interaction / Comments Box */}
            <div className="border-t border-slate-100 p-2 bg-slate-100/60">
                <div className="flex items-center gap-3 rounded-lg bg-white p-3 border border-slate-200/70 shadow-2xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">
                        R
                    </div>
                    <Link href={`/concerns/${concern.id}`} className="flex-1 text-sm text-slate-500 hover:text-slate-800 truncate">
                        Write a comment or view discussion details...
                    </Link>
                    <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary/10">
                        <Link href={`/concerns/${concern.id}`}>
                            <MessageCircle className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}