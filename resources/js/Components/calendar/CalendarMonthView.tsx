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
            className={cn('group relative flex gap-3 overflow-hidden rounded-xl border shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md p-3.5', theme.cardBorder, theme.cardBg)}
        >
            <span className={cn('absolute inset-y-0 left-0 w-1', event.going ? 'bg-emerald-500' : typeStyles[event.type].bar)} />
            <span
                className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold',
                    typeStyles[event.type].wash,
                )}
            >
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className={`truncate text-xs font-bold ${theme.textMain}`}>{event.title}</p>
                    {(event.time || compact) && (
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${theme.textMuted} bg-slate-100/50`}>
                            {compact
                                ? new Date(`${isoDate(event.date)}T00:00:00`).toLocaleDateString('en-PH', {
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : event.time}
                        </span>
                    )}
                </div>
                {event.subtitle && <p className={`mt-0.5 truncate text-[11px] ${theme.textMuted}`}>{event.subtitle}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                        className={cn(
                            'inline-flex rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ring-1 ring-inset',
                            typeStyles[event.type].chip,
                        )}
                    >
                        {typeStyles[event.type].label}
                    </span>
                    {event.going && (
                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800 ring-1 ring-inset ring-emerald-200">
                            Going
                        </span>
                    )}
                </div>
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
    const agenda = (
        <div className={`flex min-h-0 flex-1 flex-col ${theme.cardBg}`}>
            <div className={`flex items-end justify-between gap-3 border-b ${theme.dividerColor} px-5 py-4`}>
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>
                        {selected === today ? 'Today Schedule' : 'Selected Date'}
                    </p>
                    <h3 className={`mt-1 text-base font-bold tracking-tight ${theme.textMain}`}>{prettyDate(selected)}</h3>
                    <p className={`mt-0.5 text-xs ${theme.textMuted} font-medium`}>
                        {selectedEvents.length} events today · {monthEvents.length} this month
                    </p>
                </div>
                <div className={`flex h-12 w-12 flex-col items-center justify-center rounded-xl ${theme.primaryBg} text-white shadow-md font-black`}>
                    <span className="text-[9px] uppercase tracking-wider opacity-80">
                        {month_label.split(' ')[0].slice(0, 3)}
                    </span>
                    <span className="text-base leading-none">{selectedDayNumber}</span>
                </div>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto p-4 bg-slate-50/40">
                {selectedEvents.length === 0 ? (
                    <div className={`flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed ${theme.cardBorder} ${theme.cardBg} px-4 py-8 text-center shadow-2xs`}>
                        <CalendarDays className={`mb-2 h-7 w-7 ${theme.textMuted} opacity-40`} />
                        <p className={`text-xs font-bold ${theme.textMain}`}>No scheduled agenda items</p>
                        <p className={`mt-1 max-w-[16rem] text-[11px] ${theme.textMuted}`}>
                            {monthEvents.length > 0
                                ? `${monthEvents.length} items scheduled later this month.`
                                : 'No operational schedules recorded for this month.'}
                        </p>
                    </div>
                ) : (
                    selectedEvents.map((event) => <EventCard key={event.id} event={event} />)
                )}

                {split && restOfMonth.length > 0 && (
                    <div className="space-y-2.5 pt-4">
                        <p className={`px-1 text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                            Upcoming in {month_label.split(' ')[0]} ({restOfMonth.length})
                        </p>
                        {restOfMonth.map((event) => (
                            <EventCard key={`rest-${event.id}`} event={event} compact />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <section className={`overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-md`}>
            <div className={`relative overflow-hidden ${theme.primaryBg} px-6 py-6 text-white`}>
                <div className="relative flex flex-col gap-4">
                    {(heading || description) && (
                        <div>
                            {heading && <h1 className="text-xl font-black tracking-tight sm:text-2xl">{heading}</h1>}
                            {description && <p className="mt-1 max-w-xl text-xs opacity-90">{description}</p>}
                        </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => goTo(prev)}
                                aria-label="Previous month"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 cursor-pointer shadow-2xs"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="min-w-[11rem] text-center text-base font-black tracking-wide">{month_label}</p>
                            <button
                                type="button"
                                onClick={() => goTo(next)}
                                aria-label="Next month"
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 cursor-pointer shadow-2xs"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white border border-white/10">
                                {monthEvents.length} items total
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className={`h-9 rounded-xl ${theme.cardBg} ${theme.textMain} hover:opacity-90 font-extrabold shadow-xs cursor-pointer`}
                                onClick={goToday}
                            >
                                Today
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                        {legend.map((type) => (
                            <span
                                key={type}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-white border border-white/10"
                            >
                                <span className={cn('h-2.5 w-2.5 rounded-full', typeStyles[type].dot)} />
                                {typeStyles[type].label}
                                <span className="rounded-md bg-white/20 px-1.5 text-[10px] font-black ml-1">
                                    {countsByType[type]}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={cn(split ? `lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:divide-x ${theme.dividerColor}` : '')}>
                <div className="p-4 sm:p-6 bg-slate-50/20">
                    <div className={`grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase tracking-widest ${theme.textMuted} mb-2`}>
                        {weekdayLabels.map((label, index) => (
                            <div key={label} className={cn('py-1', (index === 0 || index === 6) && 'text-rose-500')}>
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1.5">
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
                                        'flex min-h-[4.5rem] flex-col items-center rounded-xl p-1.5 text-left transition-all sm:min-h-[6rem] sm:items-stretch sm:p-2 cursor-pointer border',
                                        cell.inMonth && cell.weekend && !isSelected && 'bg-slate-100/40 border-slate-200/50',
                                        cell.inMonth && !cell.weekend && !isSelected && `${theme.cardBg} ${theme.cardBorder} hover:border-blue-300 hover:shadow-2xs`,
                                        !cell.inMonth && 'border-transparent bg-transparent opacity-30 cursor-default',
                                        isSelected && cell.inMonth && `bg-blue-50/60 shadow-md ${theme.cardBorder} ring-2 ring-blue-600/30`,
                                        isToday && !isSelected && cell.inMonth && 'border-blue-400 bg-blue-50/20',
                                    )}
                                >
                                    <span className="flex w-full items-center justify-center sm:justify-between">
                                        <span
                                            className={cn(
                                                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                                isToday && `${theme.primaryBg} text-white shadow-xs`,
                                                isSelected && !isToday && `${theme.primaryText} font-black`,
                                                !cell.inMonth && 'opacity-30',
                                            )}
                                        >
                                            {cell.day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className={`hidden h-5 min-w-5 items-center justify-center rounded-md ${theme.primaryBg} px-1 text-[10px] font-black text-white sm:inline-flex shadow-2xs`}>
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-1.5 flex min-h-2 w-full flex-wrap justify-center gap-0.5 sm:hidden">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <span
                                                key={event.id}
                                                className={cn('h-1.5 w-1.5 rounded-full', event.going ? 'bg-emerald-500' : typeStyles[event.type].dot)}
                                            />
                                        ))}
                                    </span>
                                    <span className="mt-1 hidden space-y-1 sm:block">
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <span
                                                key={event.id}
                                                className={cn(
                                                    'block truncate rounded px-1.5 py-0.5 text-[9px] font-bold leading-tight shadow-2xs',
                                                    event.going ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : typeStyles[event.type].wash,
                                                )}
                                            >
                                                {event.title}
                                            </span>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <span className={`px-1 text-[9px] font-bold ${theme.textMuted}`}>
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