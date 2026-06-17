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
        <ul className="space-y-2">
            {items.map((item) => (
                <li key={item.id}>
                    <button
                        type="button"
                        disabled={readonly}
                        onClick={() => toggle(item.id)}
                        className={cn(
                            'flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors',
                            item.done ? 'border-blue-200 bg-blue-50' : 'bg-white hover:bg-slate-50',
                            readonly && 'cursor-default',
                        )}
                    >
                        <span
                            className={cn(
                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                                item.done ? 'border-blue-600 bg-blue-600 text-white' : 'border-muted-foreground/30',
                            )}
                        >
                            {item.done && <Check className="h-3 w-3" />}
                        </span>
                        <span className={cn(item.done && 'text-muted-foreground line-through')}>{item.label}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
