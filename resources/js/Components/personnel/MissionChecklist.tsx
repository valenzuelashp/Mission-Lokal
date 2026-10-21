import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, Check } from 'lucide-react';
import { cn } from '@/Lib/utils';
import type { MissionStatus, PersonnelChecklistItem } from '@/Types';

type Props = {
    missionId: string;
    items: PersonnelChecklistItem[];
    status: MissionStatus;
    assignmentAcknowledged: boolean;
    readonly?: boolean;
};

export default function MissionChecklist({
    missionId,
    items,
    status,
    assignmentAcknowledged,
    readonly = false,
}: Props) {
    const [prerequisiteNotice, setPrerequisiteNotice] = useState<string | null>(null);

    const toggle = (itemId: string) => {
        if (readonly) return;
        if (!assignmentAcknowledged) {
            setPrerequisiteNotice('Please acknowledge the assignment before updating the checklist.');
            return;
        }
        if (status !== 'in_progress') {
            setPrerequisiteNotice('Please click Start Field Work before updating the checklist.');
            return;
        }

        setPrerequisiteNotice(null);
        router.patch(
            `/personnel/missions/${missionId}/checklist`,
            { item_id: itemId },
            { preserveScroll: true },
        );
    };

    return (
        <div className="space-y-3">
            {prerequisiteNotice && (
                <div role="alert" className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                    {prerequisiteNotice}
                </div>
            )}
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            disabled={readonly}
                            onClick={() => toggle(item.id)}
                            className={cn(
                                'flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left text-xs font-black transition-all shadow-2xs cursor-pointer',
                                item.done
                                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950 shadow-none'
                                    : 'border-slate-200/80 bg-white hover:border-blue-400 hover:bg-slate-50 text-slate-900',
                                readonly && 'cursor-default opacity-80',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-xl border transition-colors shadow-2xs',
                                    item.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white',
                                )}
                            >
                                {item.done && <Check className="h-3 w-3 stroke-[3]" />}
                            </span>
                            <span className={cn('flex-1 truncate', item.done && 'text-emerald-950/60 line-through font-bold')}>
                                {item.label}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}