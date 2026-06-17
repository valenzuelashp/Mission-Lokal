import { Flame, Phone, Shield, Stethoscope, User } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { LibraryContact } from '@/Types';

const iconMap = {
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
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Emergency contacts</CardTitle>
                {contacts.length > 4 && (
                    <button
                        type="button"
                        onClick={() => setShowAll((v) => !v)}
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        {showAll ? 'Show less' : 'View all'}
                    </button>
                )}
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
                {visible.map((contact) => {
                    const Icon = iconMap[contact.icon];
                    const isEmergency = contact.emergency;

                    return (
                        <div
                            key={contact.id}
                            className="flex items-center gap-3 rounded-lg border bg-white p-3"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f5] text-muted-foreground">
                                <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.role}</p>
                            </div>
                            <a
                                href={`tel:${contact.phone}`}
                                className={cn(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white',
                                    isEmergency ? 'bg-destructive' : 'bg-primary',
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
