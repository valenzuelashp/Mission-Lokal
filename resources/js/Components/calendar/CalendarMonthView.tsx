import { Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Megaphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/Lib/utils';
import type { CalendarEvent, CalendarEventType, CalendarPageProps } from '@/Types';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const typeStyles: Record<
    CalendarEventType,
    { dot: string; chip: string; bar: string; wash: string; label: string; icon: typeof Megaphone }
> = {
    announcement: {
        dot: 'bg-sky-500',
        chip: 'bg-sky-50 text-sky-800 ring-sky-100',
        bar: 'bg-sky-500',
        wash: 'bg-sky-50 text-sky-800',
        label: 'Advisory',
        icon: Megaphone,
    },
    mission: {
        dot: 'bg-rose-500',
        chip: 'bg-rose-50 text-rose-800 ring-rose-100',
        bar: 'bg-rose-500',
        wash: 'bg-rose-50 text-rose-800',
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
    const Icon = typeStyles[event.type].icon;

    return (
        <Link
            href={event.href}
            className="group relative flex gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
        >
            <span className={cn('absolute inset-y-0 left-0 w-1', event.going ? 'bg-emerald-500' : typeStyles[event.type].bar)} />
            <span
                className={cn(
                    'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    typeStyles[event.type].wash,
                )}
            >
                <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-teal-800">{event.title}</p>
                    {(event.time || compact) && (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {compact
                                ? new Date(`${isoDate(event.date)}T00:00:00`).toLocaleDateString('en-PH', {
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : event.time}
                        </span>
                    )}
                </div>
                {event.subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.subtitle}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                        className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
                            typeStyles[event.type].chip,
                        )}
                    >
                        {typeStyles[event.type].label}
                    </span>
                    {event.going && (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-inset ring-emerald-100">
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
}: Props) {
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
    }, [defaultDay]);

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
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-end justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                        {selected === today ? 'Today' : 'Selected'}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{prettyDate(selected)}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {selectedEvents.length} on this day · {monthEvents.length} this month
                    </p>
                </div>
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm">
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                        {month_label.split(' ')[0].slice(0, 3)}
                    </span>
                    <span className="text-xl font-bold leading-none">{selectedDayNumber}</span>
                </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {selectedEvents.length === 0 ? (
                    <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center">
                        <CalendarDays className="mb-3 h-8 w-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-700">Nothing on this day</p>
                        <p className="mt-1 max-w-[16rem] text-xs text-muted-foreground">
                            {monthEvents.length > 0
                                ? `${monthEvents.length} scheduled later this month — pick a highlighted day.`
                                : 'Check back when your barangay posts an advisory.'}
                        </p>
                    </div>
                ) : (
                    selectedEvents.map((event) => <EventCard key={event.id} event={event} />)
                )}

                {split && restOfMonth.length > 0 && (
                    <div className="space-y-2 pt-3">
                        <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Rest of {month_label.split(' ')[0]} · {restOfMonth.length}
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
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_40px_-28px_rgba(15,118,110,0.45)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-5 py-5 text-white sm:px-6">
                <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-emerald-300/20" />
                <div className="relative flex flex-col gap-4">
                    {(heading || description) && (
                        <div>
                            {heading && <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{heading}</h1>}
                            {description && <p className="mt-1 max-w-xl text-sm text-teal-50/90">{description}</p>}
                        </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => goTo(prev)}
                                aria-label="Previous month"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <p className="min-w-[10.5rem] text-center text-lg font-semibold tracking-tight">{month_label}</p>
                            <button
                                type="button"
                                onClick={() => goTo(next)}
                                aria-label="Next month"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-teal-50">
                                {monthEvents.length} this month
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-8 rounded-full bg-white text-teal-800 hover:bg-teal-50"
                                onClick={goToday}
                            >
                                Today
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {legend.map((type) => (
                            <span
                                key={type}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white"
                            >
                                <span className={cn('h-2 w-2 rounded-full', typeStyles[type].dot)} />
                                {typeStyles[type].label}
                                <span className="rounded-full bg-white/20 px-1.5 text-[10px] font-semibold">
                                    {countsByType[type]}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={cn(split && 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:divide-x lg:divide-slate-100')}>
                <div className="p-3 sm:p-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {weekdayLabels.map((label, index) => (
                            <div key={label} className={cn('py-2', (index === 0 || index === 6) && 'text-rose-400/80')}>
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((cell) => {
                            const dayEvents = cell.inMonth ? eventsByDate[cell.iso] ?? [] : [];
                            const isToday = cell.iso === today;
                            const isSelected = cell.iso === selected;

                            return (
                                <button
                                    key={cell.key}
                                    type="button"
                                    disabled={!cell.inMonth}
                                    onClick={() => setSelected(cell.iso)}
                                    className={cn(
                                        'flex min-h-[4.25rem] flex-col items-center rounded-2xl px-1 py-1.5 text-left transition sm:min-h-[5.5rem] sm:items-stretch sm:px-1.5',
                                        cell.inMonth && cell.weekend && !isSelected && 'bg-slate-50/80',
                                        cell.inMonth ? 'hover:bg-teal-50/80' : 'text-slate-300',
                                        isSelected && cell.inMonth && 'bg-white shadow-md ring-2 ring-teal-500/70 hover:bg-white',
                                        isToday && !isSelected && cell.inMonth && 'ring-1 ring-teal-200',
                                    )}
                                >
                                    <span className="flex w-full items-center justify-center sm:justify-between">
                                        <span
                                            className={cn(
                                                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                                                isToday && 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm',
                                                isSelected && !isToday && 'text-teal-700',
                                                !cell.inMonth && 'text-slate-300',
                                            )}
                                        >
                                            {cell.day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <span className="hidden h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white sm:inline-flex">
                                                {dayEvents.length}
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-1 flex min-h-2 w-full flex-wrap justify-center gap-0.5 sm:hidden">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <span
                                                key={event.id}
                                                className={cn('h-1.5 w-1.5 rounded-full', event.going ? 'bg-emerald-500' : typeStyles[event.type].dot)}
                                            />
                                        ))}
                                    </span>
                                    <span className="mt-1 hidden space-y-0.5 sm:block">
                                        {dayEvents.slice(0, 2).map((event) => (
                                            <span
                                                key={event.id}
                                                className={cn(
                                                    'block truncate rounded-md px-1 py-0.5 text-[9px] font-semibold leading-tight',
                                                    event.going ? 'bg-emerald-50 text-emerald-800' : typeStyles[event.type].wash,
                                                )}
                                            >
                                                {event.going ? `Going · ${event.title}` : event.title}
                                            </span>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <span className="px-1 text-[9px] font-medium text-slate-400">
                                                +{dayEvents.length - 2} more
                                            </span>
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className={cn(split ? 'border-t border-slate-100 lg:border-t-0' : 'border-t border-slate-100')}>
                    {agenda}
                </div>
            </div>
        </section>
    );
}
