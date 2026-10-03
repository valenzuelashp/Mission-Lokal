import { Activity, ChevronDown, Flame, Waves, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
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
    const theme = useResidentTheme();
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

    return (
        <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
            <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                <CardTitle className="text-sm font-black uppercase tracking-wider">Disaster Preparedness Manuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
                {manuals.map((manual) => {
                    const Icon = iconMap[manual.icon] || ShieldAlert;
                    const isOpen = openId === manual.id;

                    return (
                        <div key={manual.id} className={`overflow-hidden rounded-xl border ${theme.cardBorder} ${theme.cardBg} transition-all shadow-2xs`}>
                            <button
                                type="button"
                                onClick={() => toggle(manual.id)}
                                className={`flex w-full items-center gap-3.5 p-3.5 text-left transition-colors ${theme.hoverBg} cursor-pointer`}
                            >
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border font-bold`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-bold">{manual.title}</span>
                                    <span className={`block text-xs ${theme.textMuted} truncate font-medium`}>{manual.subtitle}</span>
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'h-4 w-4 shrink-0 transition-transform duration-200',
                                        theme.textMuted,
                                        isOpen && 'rotate-180 text-blue-600',
                                    )}
                                />
                            </button>
                            {isOpen && (
                                <div className={`border-t ${theme.dividerColor} ${theme.inputBg} px-4 py-3.5 text-xs leading-relaxed whitespace-pre-wrap font-medium`}>
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