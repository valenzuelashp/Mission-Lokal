import { Link } from '@inertiajs/react';
import { MapPin, MessageCircle } from 'lucide-react';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import { Badge } from '@/Components/ui/badge';
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
        <article className="bg-transparent w-full">
            {/* Header Content Info Area */}
            <div className="flex items-center justify-between gap-2 p-3 pb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-black text-neutral-800 border border-neutral-200 shadow-sm">
                        ML
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-black uppercase tracking-wider text-neutral-900">{concern.category}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">{concern.created_at}</p>
                    </div>
                </div>
                <Badge variant={severityVariant[concern.severity]} className="rounded-md font-black text-[9px] uppercase px-1.5 py-0.5 shrink-0 shadow-none">
                    {severityLabel[concern.severity]}
                </Badge>
            </div>

            {/* Core Report Title Context Body */}
            <div className="px-3 pb-3 pt-1">
                <Link href={`/concerns/${concern.id}`} className="break-words text-sm font-bold tracking-tight text-neutral-950 block active:opacity-70 leading-tight">
                    {concern.title}
                </Link>
                <p className="mt-1 flex items-start gap-1 text-[11px] text-neutral-500 font-medium">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="line-clamp-1">{concern.location_label}</span>
                </p>
            </div>

            {/* Mobile Touch Action Footer Bar */}
            <div className="flex items-center justify-between gap-2 border-t border-neutral-100/70 px-3 py-2 bg-neutral-50/20">
                <ConcernVoteButtons
                    concernId={concern.id}
                    voteCount={concern.vote_count}
                    userVote={concern.user_vote ?? (concern.has_voted ? 'up' : null)}
                    compact
                />
                
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 px-1.5 py-0.5 bg-neutral-50 border border-neutral-200/50 rounded-md">
                        {concern.status.replace('_', ' ')}
                    </span>
                    <Link 
                        href={`/concerns/${concern.id}`} 
                        className="h-7 rounded-lg text-[11px] font-bold text-neutral-900 border border-neutral-200/50 px-2.5 flex items-center bg-white shadow-sm active:bg-neutral-50 transition-colors"
                    >
                        <MessageCircle className="h-3.5 w-3.5 mr-1 text-neutral-500" />
                        Details
                    </Link>
                </div>
            </div>
        </article>
    );
}