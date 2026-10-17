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
    in_progress: 'bg-red-600 text-white font-black shadow-xs animate-pulse',
    completed: 'bg-amber-50 text-amber-800 border-amber-200 font-black',
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-black',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200 font-semibold',
};

type Props = {
    status: MissionStatus;
};

export default function MissionStatusBadge({ status }: Props) {
    return <Badge className={cn("text-xs capitalize font-bold px-3 py-1 shadow-2xs rounded-xl", statusStyle[status])}>{statusLabel[status]}</Badge>;
}