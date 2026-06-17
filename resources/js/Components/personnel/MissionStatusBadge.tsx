import { Badge } from '@/Components/ui/badge';
import type { MissionStatus } from '@/Types';

const statusLabel: Record<MissionStatus, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In progress',
    completed: 'Completed',
    verified: 'Verified',
    cancelled: 'Cancelled',
};

const statusStyle: Record<MissionStatus, string> = {
    assigned: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    acknowledged: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
    in_progress: 'bg-red-600 text-white hover:bg-red-600',
    completed: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    verified: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    cancelled: 'bg-slate-100 text-slate-500 hover:bg-slate-100',
};

type Props = {
    status: MissionStatus;
};

export default function MissionStatusBadge({ status }: Props) {
    return <Badge className={statusStyle[status]}>{statusLabel[status]}</Badge>;
}
