import { Badge } from '@/Components/ui/badge';
import type { MissionStatus } from '@/Types';
import { cn } from '@/Lib/utils';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    completed: 'Completed Work',
    verified: 'Verified & Closed',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'bg-blue-50 text-blue-700 border-blue-200',
    acknowledged: 'bg-sky-50 text-sky-700 border-sky-200',
    in_progress: 'bg-red-600 text-white font-bold',
    completed: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

type Props = {
    status: MissionStatus;
};

export default function MissionStatusBadge({ status }: Props) {
    return <Badge className={cn("text-xs capitalize font-bold px-2.5 py-0.5", statusStyle[status])}>{statusLabel[status]}</Badge>;
}