import { Link } from '@inertiajs/react';
import { MapPin, MessageCircle } from 'lucide-react';
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
    concern: PublicConcern;
};

export default function ConcernCard({ concern }: Props) {
    return (
        <article className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-3 p-3 pb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    ML
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{concern.category}</p>
                    <p className="text-xs text-muted-foreground">
                        Public concern · {concern.created_at}
                    </p>
                </div>
                <Badge variant={severityVariant[concern.severity]}>{severityLabel[concern.severity]}</Badge>
            </div>

            <div className="px-3 pb-3">
                <Link href={`/concerns/${concern.id}`} className="break-words text-base font-semibold hover:text-primary hover:underline">
                    {concern.title}
                </Link>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{concern.location_label}</span>
                </p>
                {concern.images && concern.images.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                        {concern.images.map((url: string, idx: number) => (
                            <img 
                                key={idx} 
                                src={url} 
                                alt="Concern Photo" 
                                className="h-40 w-40 shrink-0 rounded-lg border border-slate-200 object-cover"
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
                <ConcernVoteButtons
                    concernId={concern.id}
                    upvotes={concern.upvotes}
                    downvotes={concern.downvotes}
                    userVote={concern.user_vote ?? null}
                    compact
                />
                <span className="text-xs capitalize text-muted-foreground">{concern.status.replace('_', ' ')}</span>
            </div>

            <div className="border-t p-1">
                <Button variant="ghost" size="sm" className="w-full gap-2 font-semibold text-muted-foreground" asChild>
                    <Link href={`/concerns/${concern.id}`}>
                        <MessageCircle className="h-5 w-5" />
                        View details
                    </Link>
                </Button>
            </div>
        </article>
    );
}
