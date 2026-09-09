import { Flame, Phone, Shield, Stethoscope, User, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
    const [showAll, setShowAll] = useState(false);
    const visible = showAll ? contacts : contacts.slice(0, 4);

    return (
        <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Emergency contacts</CardTitle>
                {contacts.length > 4 && (
                    <button
                        type="button"
                        onClick={() => setShowAll((v) => !v)}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        {showAll ? 'Show less' : `View all (${contacts.length})`}
                    </button>
                )}
            </CardHeader>
            <CardContent className="space-y-2.5 p-3 pt-3">
                {visible.map((contact) => {
                    const Icon = iconMap[contact.icon] || PhoneCall;
                    const isEmergency = contact.emergency;

                    return (
                        <div
                            key={contact.id}
                            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs transition-shadow hover:shadow-xs"
                        >
                            <span className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                                isEmergency ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                            )}>
                                <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{contact.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{contact.role}</p>
                            </div>
                            <a
                                href={`tel:${contact.phone}`}
                                className={cn(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-transform hover:scale-105 active:scale-95',
                                    isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90',
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