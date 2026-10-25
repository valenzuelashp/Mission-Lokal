import { Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Megaphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';
import type { CalendarEvent, CalendarEventType, CalendarPageProps } from '@/Types';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const typeStyles: Record<
    CalendarEventType,
    { dot: string; chip: string; bar: string; wash: string; label: string; icon: typeof Megaphone }
> = {
    announcement: {
        dot: 'bg-blue-500',
        chip: 'bg-blue-50 text-blue-800 ring-blue-100',
        bar: 'bg-blue-600',
        wash: 'bg-blue-50 text-blue-800',
        label: 'Advisory',
        icon: Megaphone,
    },
    mission: {
        dot: 'bg-red-500',
        chip: 'bg-red-50 text-red-800 ring-red-100',
        bar: 'bg-red-600',
        wash: 'bg-red-50 text-red-800',
        label: 'Mission',
        icon: ClipboardList,
    },
};

type Props = CalendarPageProps & {
    basePath: string;
    legend: CalendarEventType[];
    heading?: string;
    description?: string;
    split?: boolean;
    onSelectedDayChange?: (date: string) => void;
};

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function dateKey(year: number, month: number, day: number): string {
    return `${year}-${pad(month)}-${pad(day)}`;
}

function isoDate(value: string): string {
    return String(value).slice(0, 10);
}

function prettyDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

function EventCard({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
    const theme = useResidentTheme();
    const Icon = typeStyles[event.type].icon;

    return (
        <Link
            href={event.href}
            className={cn('group relative flex gap-3.5 overflow-hidden rounded-2xl border shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md p-4', theme.cardBorder, theme.cardBg)}
        >
            <span className={cn('absolute inset-y-0 left-0 w-1.5', event.going ? 'bg-emerald-500' : typeStyles[event.type].bar)} />
            <span
                className={cn(
                    'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs',
                    typeStyles[event.type].wash,
                )}
            >
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                        className={cn(
                            'inline-flex rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset',
                            typeStyles[event.type].chip,
                        )}
                    >
                        {event.subtitle || typeStyles[event.type].label}
                    </span>
                    {(event.time || compact) && (
                        <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black ${theme.textMuted} bg-slate-100/70 border border-slate-200/60`}>
                            {compact
                                ? new Date(`${isoDate(event.date)}T00:00:00`).toLocaleDateString('en-PH', {
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : event.time}
                        </span>
                    )}
                </div>

                <p className={`text-xs font-black ${theme.textMain} leading-snug break-words`}>{event.title}</p>

                {event.going && (
                    <div>
                        <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 ring-1 ring-inset ring-emerald-200">
                            Going
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}

export default function CalendarMonthView({
    year,
    month,
    month_label,
    today,
    prev,
    next,
    events,
    basePath,
    legend,
    heading,
    description,
    split = false,
    onSelectedDayChange,
}: Props) {
    const theme = useResidentTheme();
    const monthEvents = useMemo(() => {
        const prefix = `${year}-${pad(month)}-`;
        return events.filter((event) => isoDate(event.date).startsWith(prefix));
    }, [events, year, month]);

    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        for (const event of monthEvents) {
            const key = isoDate(event.date);
            (map[key] ??= []).push(event);
        }
        return map;
    }, [monthEvents]);

    const countsByType = useMemo(() => {
        const counts: Record<CalendarEventType, number> = {
            announcement: 0,
            mission: 0,
        };
        for (const event of monthEvents) {
            counts[event.type] += 1;
        }
        return counts;
    }, [monthEvents]);

    const defaultDay = useMemo(() => {
        if (today.startsWith(`${year}-${pad(month)}-`)) {
            return today;
        }
        return monthEvents[0]?.date ?? dateKey(year, month, 1);
    }, [today, year, month, monthEvents]);

    const [selected, setSelected] = useState(defaultDay);
    const selectedEvents = eventsByDate[selected] ?? [];
    const restOfMonth = monthEvents.filter((event) => isoDate(event.date) !== selected);
    const viewingCurrentMonth = today.startsWith(`${year}-${pad(month)}-`);

    useEffect(() => {
        setSelected(defaultDay);
        onSelectedDayChange?.(defaultDay);
    }, [defaultDay, onSelectedDayChange]);

    const cells = useMemo(() => {
        const firstWeekday = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const daysInPrev = new Date(year, month - 1, 0).getDate();
        const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
        const items: { key: string; day: number; inMonth: boolean; iso: string; weekend: boolean }[] = [];

        for (let index = 0; index < total; index += 1) {
            const offset = index - firstWeekday + 1;
            const weekend = index % 7 === 0 || index % 7 === 6;
            if (offset < 1) {
                const day = daysInPrev + offset;
                const prevMonth = month === 1 ? 12 : month - 1;
                const prevYear = month === 1 ? year - 1 : year;
                items.push({
                    key: `prev-${day}`,
                    day,
                    inMonth: false,
                    iso: dateKey(prevYear, prevMonth, day),
                    weekend,
                });
            } else if (offset > daysInMonth) {
                const day = offset - daysInMonth;
                const nextMonth = month === 12 ? 1 : month + 1;
                const nextYear = month === 12 ? year + 1 : year;
                items.push({
                    key: `next-${day}`,
                    day,
                    inMonth: false,
                    iso: dateKey(nextYear, nextMonth, day),
                    weekend,
                });
            } else {
                items.push({
                    key: `day-${offset}`,
                    day: offset,
                    inMonth: true,
                    iso: dateKey(year, month, offset),
                    weekend,
                });
            }
        }

        return items;
    }, [year, month]);

    const goTo = (target: { year: number; month: number }) => {
        router.get(basePath, target, { preserveScroll: true, preserveState: false });
    };

    const goToday = () => {
        const [todayYear, todayMonth] = today.split('-').map(Number);
        if (viewingCurrentMonth) {
            setSelected(today);
            return;
        }
        goTo({ year: todayYear, month: todayMonth });
    };

    const selectedDayNumber = Number(selected.slice(-2));

    // Split remaining events into strictly upcoming and past
    const pastRestEvents = useMemo(() => restOfMonth.filter(e => isoDate(e.date) < today), [restOfMonth, today]);
    const upcomingRestEvents = useMemo(() => restOfMonth.filter(e => isoDate(e.date) >= today), [restOfMonth, today]);

    // Dynamic empty state text generator based on today's date
    const emptyStateText = useMemo(() => {
        if (monthEvents.length === 0) return 'No operational schedules recorded for this month.';
        
        const upcomingCount = monthEvents.filter((e) => isoDate(e.date) >= today).length;
        if (upcomingCount === monthEvents.length) return `${monthEvents.length} items scheduled later this month.`;
        if (upcomingCount === 0) return `${monthEvents.length} items were scheduled earlier this month.`;
        return `${monthEvents.length} items scheduled this month.`;
    }, [monthEvents, today]);

    const agenda = (
        <div className={`flex min-h-0 flex-1 flex-col ${theme.cardBg}`}>
            <div className={`flex items-end justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-5 ${theme.dividerColor}`}>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>
                        {selected === today ? "Today's Schedule" : 'Selected Date'}
                    </p>
                    <h3 className={`mt-1 text-base font-black tracking-tight ${theme.textMain}`}>{prettyDate(selected)}</h3>
                    <p className={`mt-0.5 text-xs ${theme.textMuted} font-semibold`}>
                        {selectedEvents.length} events today · {monthEvents.length} this month
                    </p>
                </div>
                <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-2xl ${theme.primaryBg} text-white shadow-md font-black`}>
                    <span className="text-[9px] uppercase tracking-wider opacity-85">
                        {month_label.split(' ')[0].slice(0, 3)}
                    </span>
                    <span className="text-base leading-none">{selectedDayNumber}</span>
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-3 sm:p-5">
                {selectedEvents.length === 0 ? (
                    <div className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-center shadow-2xs sm:min-h-36 sm:py-8 ${theme.cardBorder} ${theme.cardBg}`}>
                        <CalendarDays className={`mb-2.5 h-8 w-8 ${theme.textMuted} opacity-40`} />
                        <p className={`text-xs font-bold ${theme.textMain}`}>No scheduled agenda items</p>
                        <p className={`mt-1 max-w-[16rem] text-[11px] ${theme.textMuted} font-medium`}>
                            {emptyStateText}
                        </p>
                    </div>
                ) : (
                    selectedEvents.map((event) => <EventCard key={event.id} event={event} />)
                )}

                {split && (pastRestEvents.length > 0 || upcomingRestEvents.length > 0) && (
                    <div className="space-y-6 pt-5 border-t border-slate-200/60">
                        {upcomingRestEvents.length > 0 && (
                            <div className="space-y-3">
                                <p className={`px-1 text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                                    Upcoming in {month_label.split(' ')[0]} ({upcomingRestEvents.length})
                                </p>
                                {upcomingRestEvents.map((event) => (
                                    <EventCard key={`rest-up-${event.id}`} event={event} compact />
                                ))}
                            </div>
                        )}
                        
                        {pastRestEvents.length > 0 && (
                            <div className="space-y-3">
                                <p className={`px-1 text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                                    Past events in {month_label.split(' ')[0]} ({pastRestEvents.length})
                                </p>
                                {pastRestEvents.map((event) => (
                                    <EventCard key={`rest-past-${event.id}`} event={event} compact />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <section className={`overflow-hidden rounded-3xl border ${theme.cardBorder} ${theme.cardBg} shadow-xl`}>
            <div className={`relative overflow-hidden ${theme.primaryBg} px-4 py-4 text-white sm:px-6 sm:py-7`}>
                <div className="relative flex flex-col gap-3 sm:gap-5">
                    {(heading || description) && (
                        <div>
                            {heading && <h1 className="text-lg font-black tracking-tight sm:text-2xl">{heading}</h1>}
                            {description && <p className="mt-1 hidden max-w-xl text-xs font-medium leading-relaxed opacity-90 sm:block">{description}</p>}
                        </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => goTo(prev)}
                                aria-label="Previous month"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white shadow-2xs transition-all hover:bg-white/25 sm:h-10 sm:w-10 sm:rounded-2xl"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="min-w-0 text-center text-sm font-black tracking-wide sm:min-w-[12rem] sm:text-base">{month_label}</p>
                            <button
                                type="button"
                                onClick={() => goTo(next)}
                                aria-label="Next month"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white/15 text-white shadow-2xs transition-all hover:bg-white/25 sm:h-10 sm:w-10 sm:rounded-2xl"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-xl border border-white/15 bg-white/15 px-2.5 py-1.5 text-[11px] font-black text-white sm:rounded-2xl sm:px-3.5 sm:py-2 sm:text-xs">
                                {monthEvents.length} items total
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className={`h-8 cursor-pointer rounded-xl px-3 font-black shadow-xs hover:opacity-95 sm:h-10 sm:rounded-2xl sm:px-4 ${theme.cardBg} ${theme.textMain}`}
                                onClick={goToday}
                            >
                                Today
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2.5 sm:pt-1">
                        {legend.map((type) => (
                            <span
                                key={type}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/15 px-2 py-1 text-[10px] font-black text-white shadow-2xs sm:gap-2 sm:rounded-xl sm:px-3.5 sm:py-1.5 sm:text-xs"
                            >
                                <span className={cn('h-2.5 w-2.5 rounded-full', typeStyles[type].dot)} />
                                {typeStyles[type].label}
                                <span className="rounded-lg bg-white/25 px-2 py-0.5 text-[10px] font-black ml-1">
                                    {countsByType[type]}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={cn(split ? `lg:grid lg:grid-cols-[minmax(0,2.6fr)_18rem] lg:divide-x ${theme.dividerColor}` : '')}>
                <div className="bg-slate-50/40 p-2 sm:p-7">
                    <div className={`mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-widest sm:mb-3 sm:gap-2 ${theme.textMuted}`}>
                        {weekdayLabels.map((label, index) => (
                            <div key={label} className={cn('py-1', (index === 0 || index === 6) && 'text-rose-500 font-black')}>
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {cells.map((cell) => {
                            const dayEvents = cell.inMonth ? eventsByDate[cell.iso] ?? [] : [];
                            const isToday = cell.iso === today;
                            const isSelected = cell.iso === selected;

                            return (
                                <button
                                    key={cell.key}
                                    type="button"
                                    disabled={!cell.inMonth}
                                    onClick={() => {
                                        setSelected(cell.iso);
                                        onSelectedDayChange?.(cell.iso);
                                    }}
                                    className={cn(
                                        'flex min-h-10 cursor-pointer flex-col items-center rounded-xl border p-1 text-left shadow-2xs transition-all sm:min-h-[6.5rem] sm:items-stretch sm:rounded-2xl sm:p-2.5',
                                        cell.inMonth && cell.weekend && !isSelected && 'bg-slate-100/60 border-slate-200/60',
                                        cell.inMonth && !cell.weekend && !isSelected && `${theme.cardBg} ${theme.cardBorder} hover:border-blue-400 hover:shadow-md`,
                                        !cell.inMonth && 'border-transparent bg-transparent opacity-25 cursor-default shadow-none',
                                        isSelected && cell.inMonth && `bg-blue-50/80 shadow-md ${theme.cardBorder} ring-2 ring-blue-600/30`,
                                        isToday && !isSelected && cell.inMonth && 'border-blue-400 bg-blue-50/30',
                                    )}
                                >
                                    <span className="flex w-full items-center justify-center sm:justify-between">
                                        <span
                                            className={cn(
                                                'flex h-7 w-7 items-center justify-center rounded-xl text-xs font-black transition-colors',
                                                isToday && `${theme.primaryBg} text-white shadow-xs`,
                                                isSelected && !isToday && `${theme.primaryText} font-black`,
                                                !cell.inMonth && 'opacity-30',
                                            )}
                                        >
                                            {cell.day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className={`hidden h-5 min-w-5 items-center justify-center rounded-lg ${theme.primaryBg} px-1.5 text-[10px] font-black text-white sm:inline-flex shadow-2xs`}>
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-2 flex min-h-2.5 w-full flex-wrap justify-center gap-1 sm:hidden">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <span
                                                key={event.id}
                                                className={cn('h-2 w-2 rounded-full', event.going ? 'bg-emerald-500' : typeStyles[event.type].dot)}
                                            />
                                        ))}
                                    </span>
                                    <span className="mt-2 hidden space-y-1 sm:block">
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <span
                                                key={event.id}
                                                className={cn(
                                                    'block truncate rounded-lg px-2 py-1 text-[10px] font-black leading-tight shadow-2xs border',
                                                    event.going ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : typeStyles[event.type].wash,
                                                )}
                                            >
                                                {event.title}
                                            </span>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <span className={`px-1 text-[10px] font-bold ${theme.textMuted}`}>
                                                +{dayEvents.length - 2} more
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className={cn(split ? `border-t ${theme.dividerColor} lg:border-t-0` : `border-t ${theme.dividerColor}`)}>
                    {agenda}
                </div>
            </div>
        </section>
    );
}