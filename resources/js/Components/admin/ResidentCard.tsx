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

const statusStyle: Record<VerificationStatus, 'success' | 'warning' | 'outline' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    in_progress: 'warning',
    rejected: 'danger',
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
        <Link href={`/admin/residents/${resident.id}`}>
            <Card className="shadow-sm transition-shadow active:shadow-md">
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug">{resident.full_name}</p>
                            <p className="text-xs text-muted-foreground">{resident.account_id}</p>
                        </div>
                        <Badge variant={statusStyle[resident.verification_status]} className="shrink-0">
                            {statusLabel[resident.verification_status]}
                        </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{resident.address}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-800">
                            <Award className="h-3.5 w-3.5" />
                            {resident.civic_xp} XP
                        </span>
                        <span className="text-muted-foreground">{resident.report_count} reports</span>
                        <span className="ml-auto font-medium text-blue-700">
                            View
                            <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
