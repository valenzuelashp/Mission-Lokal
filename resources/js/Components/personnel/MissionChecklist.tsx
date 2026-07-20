import { router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { cn } from '@/Lib/utils';
import type { PersonnelChecklistItem } from '@/Types';

type Props = {
    missionId: string;
    items: PersonnelChecklistItem[];
    readonly?: boolean;
};

export default function MissionChecklist({ missionId, items, readonly = false }: Props) {
    const toggle = (itemId: string) => {
        if (readonly) return;
        router.patch(
            `/personnel/missions/${missionId}/checklist`,
            { item_id: itemId },
            { preserveScroll: true },
        );
    };

    return (
        <ul className="space-y-2.5">
            {items.map((item) => (
                <li key={item.id}>
                    <button
                        type="button"
                        disabled={readonly}
                        onClick={() => toggle(item.id)}
                        className={cn(
                            'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs font-bold tracking-tight shadow-sm backdrop-blur-md transition-all duration-200 active:scale-[0.995]',
                            item.done 
                                ? 'border-neutral-200 bg-neutral-50/60 text-neutral-400' 
                                : 'border-neutral-200/60 bg-white/90 text-neutral-800 hover:border-neutral-400 hover:bg-white',
                            readonly && 'cursor-default opacity-85 active:scale-100',
                        )}
                    >
                        <span
                            className={cn(
                                'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all duration-300',
                                item.done ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white',
                            )}
                        >
                            {item.done && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span className={cn('pt-0.5 transition-all', item.done && 'line-through decoration-neutral-300')}>
                            {item.label}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}