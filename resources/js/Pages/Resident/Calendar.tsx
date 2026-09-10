import { Head } from '@inertiajs/react';
import { Bell, CalendarDays } from 'lucide-react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    const rightAside = (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm">
            <div className="bg-gradient-to-br from-teal-700 to-emerald-600 px-4 py-3 text-white">
                <p className="text-sm font-semibold">On this calendar</p>
            </div>
            <CardContent className="space-y-3 p-4 text-sm">
                <div className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <Bell className="h-4 w-4" />
                    </span>
                    <p className="text-muted-foreground">
                        <span className="font-medium text-slate-800">Advisories</span> posted by your barangay hall.
                    </p>
                </div>
                <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                    Volunteer calls you tap <span className="font-semibold">I can help</span> on are marked{' '}
                    <span className="font-semibold">Going</span> here.
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                    <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
                    Tap a day, then open an item to read the full announcement.
                </p>
            </CardContent>
        </Card>
    );

    return (
        <ResidentLayout wide>
            <Head title="Calendar" />
            <ResidentSocialShell right={rightAside}>
                <CalendarMonthView
                    {...props}
                    basePath="/calendar"
                    heading="Barangay calendar"
                    description={`Published advisories for ${props.month_label}.`}
                    legend={['announcement']}
                />
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
