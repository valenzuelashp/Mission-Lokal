import { Activity, ChevronDown, Flame, Waves, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { LibraryManual } from '@/Types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    flood: Waves,
    earthquake: Activity,
    fire: Flame,
};

type Props = {
    manuals: LibraryManual[];
};

export default function PreparednessManuals({ manuals }: Props) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

    return (
        <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Preparedness manuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-3 pt-3">
                {manuals.map((manual) => {
                    const Icon = iconMap[manual.icon] || ShieldAlert;
                    const isOpen = openId === manual.id;

                    return (
                        <div key={manual.id} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white transition-all shadow-2xs">
                            <button
                                type="button"
                                onClick={() => toggle(manual.id)}
                                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-slate-50/80"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-slate-900">{manual.title}</span>
                                    <span className="block text-xs text-muted-foreground truncate">{manual.subtitle}</span>
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
                                        isOpen && 'rotate-180 text-primary',
                                    )}
                                />
                            </button>
                            {isOpen && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {manual.body}
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}