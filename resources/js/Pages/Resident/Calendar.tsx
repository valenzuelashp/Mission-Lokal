import { Head, Link } from '@inertiajs/react';
import { Bell, CalendarDays } from 'lucide-react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { CalendarEvent, CalendarPageProps } from '@/Types';
import { useState } from 'react';

function formatSelectedDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

export default function Calendar(props: CalendarPageProps) {
    const initialDate = props.today.startsWith(`${props.year}-${String(props.month).padStart(2, '0')}-`)
        ? props.today
        : props.events[0]?.date?.slice(0, 10) ?? `${props.year}-${String(props.month).padStart(2, '0')}-01`;
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const selectedEvents = props.events.filter((event) => event.date.slice(0, 10) === selectedDate);

    const rightAside = (
        <div className="space-y-4">
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

            <Card className="overflow-hidden border-slate-200/80 shadow-sm">
                <CardContent className="p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700">Selected day</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">{formatSelectedDate(selectedDate)}</h3>
                    <div className="mt-3 space-y-2">
                        {selectedEvents.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-muted-foreground">
                                Nothing important is happening this day.
                            </p>
                        ) : (
                            selectedEvents.map((event: CalendarEvent) => (
                                <Link key={event.id} href={event.href} className="block rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 hover:border-teal-200 hover:bg-teal-50">
                                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                    {event.time && <p className="mt-1 text-xs text-muted-foreground">{event.time}</p>}
                                    {event.subtitle && <p className="mt-1 text-xs text-muted-foreground">{event.subtitle}</p>}
                                </Link>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
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
                    onSelectedDayChange={setSelectedDate}
                />
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
