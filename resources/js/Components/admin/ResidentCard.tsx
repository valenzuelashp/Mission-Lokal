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
            <Card className="shadow-sm transition-shadow active:shadow-md hover:border-blue-300">
                <CardContent className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800 shadow-sm">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold leading-snug text-gray-900">{resident.full_name}</p>
                            <p className="text-xs font-mono font-semibold text-blue-800">{resident.account_id}</p>
                        </div>
                        <Badge variant={statusStyle[resident.verification_status]} className="shrink-0">
                            {statusLabel[resident.verification_status]}
                        </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{resident.address}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                            <Award className="h-3.5 w-3.5 text-blue-600" />
                            {resident.civic_xp} XP
                        </span>
                        <span className="text-gray-700 font-medium">{resident.reports_count ?? 0} reports</span>
                        <span className="ml-auto font-bold text-blue-700 inline-flex items-center">
                            View
                            <ChevronRight className="ml-0.5 inline h-3.5 w-3.5" />
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}