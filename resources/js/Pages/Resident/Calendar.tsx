import { Head, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
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
    const theme = useResidentTheme();
    const initialDate = props.today.startsWith(`${props.year}-${String(props.month).padStart(2, '0')}-`)
        ? props.today
        : props.events[0]?.date?.slice(0, 10) ?? `${props.year}-${String(props.month).padStart(2, '0')}-01`;
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const selectedEvents = props.events.filter((event) => event.date.slice(0, 10) === selectedDate);

    const rightAside = (
        <div className="space-y-4">
            <Card className={`overflow-hidden border ${theme.cardBorder} shadow-xs rounded-2xl ${theme.cardBg}`}>
                <div className={`bg-gradient-to-br ${theme.primaryBg} px-5 py-4 text-white`}>
                    <p className="text-xs font-black uppercase tracking-widest opacity-80">Schedule Overview</p>
                    <h3 className="text-sm font-bold mt-0.5">Municipal Calendar Grid</h3>
                </div>
                <CardContent className="space-y-3 p-4 text-xs font-medium">
                    <div className="flex gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border`}>
                            <Bell className="h-4 w-4" />
                        </span>
                        <p className={`${theme.textMuted} leading-relaxed`}>
                            <strong className="font-bold">Advisories, events, and volunteer calls</strong> published directly from the barangay hall.
                        </p>
                    </div>
                    <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-emerald-900 border border-emerald-200">
                        <span>✓ Volunteer calls you sign up for are automatically marked <strong className="font-extrabold">Going</strong>.</span>
                    </p>
                </CardContent>
            </Card>

            <Card className={`overflow-hidden border ${theme.cardBorder} shadow-xs rounded-2xl ${theme.cardBg}`}>
                <CardContent className="p-5">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>Selected Date Agenda</p>
                    <h3 className="mt-1 text-sm font-extrabold">{formatSelectedDate(selectedDate)}</h3>
                    <div className="mt-3 space-y-2">
                        {selectedEvents.length === 0 ? (
                            <p className={`rounded-xl border border-dashed ${theme.cardBorder} bg-slate-50/50 p-4 text-xs font-medium ${theme.textMuted} text-center`}>
                                No scheduled events for this specific date.
                            </p>
                        ) : (
                            selectedEvents.map((event: CalendarEvent) => (
                                <Link key={event.id} href={event.href} className={`block rounded-xl border ${theme.cardBorder} ${theme.inputBg} p-3 hover:border-blue-300 transition-all shadow-2xs`}>
                                    <p className="text-xs font-bold">{event.title}</p>
                                    {event.time && <p className={`mt-1 text-[11px] ${theme.textMuted} font-semibold`}>{event.time}</p>}
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
                    heading="Municipal Community Calendar"
                    description={`Schedule of events, assemblies, and deadlines for ${props.month_label}.`}
                    legend={['announcement']}
                    onSelectedDayChange={setSelectedDate}
                />
            </ResidentSocialShell>
        </ResidentLayout>
    );
}