import { Link } from '@inertiajs/react';
import { Award, ChevronRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminResident, VerificationStatus } from '@/Types';

const statusLabel: Record<VerificationStatus, string> = {
    approved: 'Verified',
    pending: 'Pending',
    in_progress: 'ID review',
    rejected: 'Rejected',
};

const statusStyle: Record<VerificationStatus, string> = {
    approved: 'bg-neutral-900 text-white border-transparent shadow-xs',
    pending: 'bg-white border-neutral-200 text-neutral-500',
    in_progress: 'bg-neutral-50 border-neutral-200/60 text-neutral-600',
    rejected: 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 line-through',
};

type Props = {
    resident: AdminResident;
};

export default function ResidentCard({ resident }: Props) {
    const initials = resident.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('');

    return (
        <Link href={`/admin/residents/${resident.id}`} className="block group">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-neutral-400/60 group-hover:shadow-md active:scale-[0.995]">
                <CardContent className="space-y-3 p-4.5">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-black uppercase tracking-wider text-neutral-800 shadow-2xs">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">{resident.full_name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{resident.account_id}</p>
                        </div>
                        <Badge className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all ${statusStyle[resident.verification_status]}`}>
                            {statusLabel[resident.verification_status]}
                        </Badge>
                    </div>
                    
                    <p className="line-clamp-2 text-xs font-medium text-neutral-500 leading-relaxed">{resident.address}</p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100/60 text-[10px] font-black uppercase tracking-widest">
                        <span className="inline-flex items-center gap-1 text-neutral-900 bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-0.5 shadow-2xs">
                            <Award className="h-3.5 w-3.5 stroke-[2.5]" />
                            {resident.civic_xp} XP
                        </span>
                        <span className="text-neutral-400 tracking-wider font-bold tabular-nums">{resident.report_count} reports filed</span>
                        
                        <span className="ml-auto text-[11px] text-neutral-900 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            View Ledger
                            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}