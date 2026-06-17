import { Activity, ChevronDown, Flame, Waves } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { LibraryManual } from '@/Types';

const iconMap = {
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
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Preparedness manuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
                {manuals.map((manual) => {
                    const Icon = iconMap[manual.icon];
                    const isOpen = openId === manual.id;

                    return (
                        <div key={manual.id} className="overflow-hidden rounded-lg border bg-white">
                            <button
                                type="button"
                                onClick={() => toggle(manual.id)}
                                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-[#f0f2f5]"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold">{manual.title}</span>
                                    <span className="block text-xs text-muted-foreground">{manual.subtitle}</span>
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                                        isOpen && 'rotate-180',
                                    )}
                                />
                            </button>
                            {isOpen && (
                                <div className="border-t px-3 pb-3 pt-2 text-sm text-muted-foreground">
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
