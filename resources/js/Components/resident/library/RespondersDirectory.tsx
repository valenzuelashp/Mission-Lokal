import { Flame, Phone, Shield, Stethoscope, User, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';
import type { LibraryContact } from '@/Types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    office: User,
    fire: Flame,
    health: Stethoscope,
    police: Shield,
};

type Props = {
    contacts: LibraryContact[];
};

export default function RespondersDirectory({ contacts }: Props) {
    const theme = useResidentTheme();
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? contacts : contacts.slice(0, 4);

    return (
        <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
            <CardHeader className={`flex flex-row items-center justify-between pb-3 border-b ${theme.dividerColor}`}>
                <CardTitle className="text-sm font-black uppercase tracking-wider">Verified Emergency Hotlines</CardTitle>
                {contacts.length > 4 && (
                    <button
                        type="button"
                        onClick={() => setShowAll((v) => !v)}
                        className={`text-xs font-bold ${theme.primaryText} hover:underline cursor-pointer`}
                    >
                        {showAll ? 'Show less' : `View all (${contacts.length})`}
                    </button>
                )}
            </CardHeader>
            <CardContent className="space-y-3 p-4">
                {visible.map((contact) => {
                    const Icon = iconMap[contact.icon] || PhoneCall;

                    return (
                        <div
                            key={contact.id}
                            className={`flex items-center gap-3.5 rounded-xl border ${theme.cardBorder} ${theme.cardBg} p-3.5 shadow-2xs transition-all`}
                        >
                            <span className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold border',
                                `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`
                            )}>
                                <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm font-bold ${theme.textMain} truncate`}>{contact.name}</p>
                                <p className={`text-xs ${theme.textMuted} truncate font-medium`}>{contact.role}</p>
                            </div>
                            <a
                                href={`tel:${contact.phone}`}
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform hover:scale-105 active:scale-95',
                                    `${theme.primaryBg} ${theme.primaryHover}`,
                                )}
                                aria-label={`Call ${contact.name}`}
                            >
                                <Phone className="h-4 w-4" />
                            </a>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}