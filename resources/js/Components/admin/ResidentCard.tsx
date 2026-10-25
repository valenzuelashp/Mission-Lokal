import { Link } from '@inertiajs/react';
import { Award, ChevronRight } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import type { AdminResident, VerificationStatus } from '@/Types';
import UserAvatar from '@/Components/shared/UserAvatar';
import { cn } from '@/Lib/utils';

const statusLabel: Record<VerificationStatus, string> = {
    approved: 'Verified',
    pending: 'Pending',
    in_progress: 'ID Review',
    rejected: 'Rejected',
};

type Props = {
    resident: AdminResident;
};

export default function ResidentCard({ resident }: Props) {
    const isVerified = resident.verification_status === 'approved';

    return (
        <Link href={`/admin/residents/${resident.id}`} className="block group">
            <Card className="shadow-2xs transition-all duration-200 hover:shadow-md hover:border-blue-300 border-slate-200/80 bg-white rounded-3xl">
                <CardContent className="space-y-4 p-5">
                    <div className="flex items-start gap-4">
                        <UserAvatar
                            src={resident.profile_photo_url}
                            name={resident.full_name}
                            className="h-12 w-12 shrink-0 rounded-2xl border border-blue-100 bg-blue-50 font-black text-blue-700 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="font-extrabold leading-snug text-slate-900 group-hover:text-blue-700 transition-colors text-sm">{resident.full_name}</p>
                            <p className="text-xs font-mono font-bold text-blue-600 mt-0.5">{resident.account_id}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-bold shrink-0 px-2.5 py-1", isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                            {statusLabel[resident.verification_status]}
                        </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500 font-medium">{resident.address}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1.5 font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 shadow-2xs">
                            <Award className="h-3.5 w-3.5 text-blue-600" />
                            {resident.civic_xp} XP
                        </span>
                        <span className="text-slate-600 font-bold">{resident.reports_count ?? 0} reports</span>
                        <span className="ml-auto font-black text-blue-700 inline-flex items-center group-hover:underline">
                            View
                            <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}