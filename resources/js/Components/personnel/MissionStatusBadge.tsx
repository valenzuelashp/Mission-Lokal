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
    assigned: 'bg-neutral-100 text-neutral-800 border-neutral-200 hover:bg-neutral-100',
    acknowledged: 'bg-neutral-50 text-neutral-600 border-neutral-200/40 hover:bg-neutral-50',
    in_progress: 'bg-neutral-900 text-white border-transparent hover:bg-neutral-900 shadow-sm',
    completed: 'bg-neutral-50 text-neutral-500 border-neutral-200/40 hover:bg-neutral-50 line-through decoration-neutral-300',
    verified: 'bg-neutral-900 text-neutral-100 border-transparent hover:bg-neutral-900 font-black',
    cancelled: 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-100 opacity-60',
};

type Props = {
    status: MissionStatus;
};

export default function MissionStatusBadge({ status }: Props) {
    return (
        <Badge className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${statusStyle[status]}`}>
            {statusLabel[status]}
        </Badge>
    );
}