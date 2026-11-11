import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, Clock3, FileText, FolderKanban, Loader2, TrendingUp } from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Button } from '@/Components/ui/button';
import AnalyticsChartCard from '@/Components/admin/AnalyticsChartCard';
import AnalyticsMetricComparison from '@/Components/admin/AnalyticsMetricComparison';
import AnalyticsWorkload from '@/Components/admin/AnalyticsWorkload';
import type { AnalyticsRange, DashboardAnalyticsData } from '@/Types/dashboardAnalytics';

const statusLabels: Record<string, string> = {
    assigned: 'Assigned',
    acknowledged: 'Acknowledged',
    in_progress: 'In progress',
    completed: 'Awaiting verification',
    verified: 'Verified',
    cancelled: 'Cancelled',
};
const statusColors: Record<string, string> = {
    assigned: '#3b82f6', acknowledged: '#06b6d4', in_progress: '#8b5cf6',
    completed: '#f59e0b', verified: '#10b981', cancelled: '#94a3b8',
};
const severityColors: Record<string, string> = {
    critical: '#dc2626', high: '#f97316', medium: '#eab308', low: '#10b981', unclassified: '#94a3b8',
};
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 };
const axisStyle = { fontSize: 11, fill: '#64748b' };
const countFormat = new Intl.NumberFormat('en-PH');

function dateLabel(date: string, full = false) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric', ...(full ? { year: 'numeric' } : {}),
    });
}

interface Filters {
    analytics_range: AnalyticsRange;
    analytics_start: string;
    analytics_end: string;
}

export default function DashboardAnalytics({ analytics }: { analytics: DashboardAnalyticsData }) {
    const { period, summary, comparison, workload, trend, categories, severities, statuses } = analytics;
    const form = useForm<Filters>({
        analytics_range: period.range,
        analytics_start: period.start,
        analytics_end: period.end,
    });

    useEffect(() => {
        form.setData({ analytics_range: period.range, analytics_start: period.start, analytics_end: period.end });
    }, [period.range, period.start, period.end]);

    function applyRange(range: AnalyticsRange) {
        form.clearErrors();
        form.transform(data => range === 'custom' ? { ...data, analytics_range: range } : { analytics_range: range });
        form.get('/admin/analytics', { only: ['analytics'], preserveState: true, preserveScroll: true, replace: true });
    }

    const missionData = statuses.map(item => ({ ...item, name: statusLabels[item.status] ?? item.status, fill: statusColors[item.status] ?? '#94a3b8' }));
    const severityData = severities.map(item => ({ ...item, name: item.severity.charAt(0).toUpperCase() + item.severity.slice(1), fill: severityColors[item.severity] ?? '#94a3b8' }));
    const selectedRange = form.data.analytics_range;
    const periodLabel = `${dateLabel(period.start, true)} – ${dateLabel(period.end, true)} · ${period.timezone}`;
    const summaryCards = [
        { label: 'Reports received', value: countFormat.format(summary.reports_received), hint: 'Submitted in this period', icon: FileText, color: 'bg-blue-50 text-blue-700' },
        { label: 'Missions created', value: countFormat.format(summary.missions_created), hint: 'Created in this period', icon: FolderKanban, color: 'bg-violet-50 text-violet-700' },
        { label: 'Missions verified', value: countFormat.format(summary.missions_verified), hint: 'Verified in this period', icon: BadgeCheck, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Avg. verification time', value: summary.average_verification_hours === null ? '—' : `${summary.average_verification_hours.toLocaleString('en-PH')} hrs`, hint: 'Creation to verification · verified in period', icon: Clock3, color: 'bg-amber-50 text-amber-700' },
    ];
    const metricKeys = ['reports_received', 'missions_created', 'missions_verified', 'average_verification_hours'] as const;

    return (
        <section aria-labelledby="analytics-heading" aria-busy={form.processing} className="space-y-5">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div>
                    <h2 id="analytics-heading" className="flex items-center gap-2 text-lg font-black text-slate-900">
                        <TrendingUp className="h-5 w-5 text-blue-600" aria-hidden="true" /> Analytics overview
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500" aria-live="polite">
                        {dateLabel(period.start, true)} – {dateLabel(period.end, true)} · {period.timezone}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Choose a period to explore trends. Open a data table to see exact figures.</p>
                </div>
                <div role="group" aria-label="Analytics date range" className="flex flex-wrap items-center gap-2">
                    {(['7', '30', '90', 'custom'] as const).map(range => (
                        <button
                            key={range}
                            type="button"
                            aria-pressed={selectedRange === range}
                            disabled={form.processing}
                            onClick={() => {
                                if (range === 'custom') {
                                    form.setData('analytics_range', range);
                                    form.clearErrors();
                                } else {
                                    applyRange(range);
                                }
                            }}
                            className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60 ${selectedRange === range ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-blue-50'}`}
                        >
                            {range === 'custom' ? 'Custom dates' : `Last ${range} days`}
                        </button>
                    ))}
                    {form.processing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-label="Updating analytics" />}
                </div>
            </div>

            {selectedRange === 'custom' && (
                <form onSubmit={event => { event.preventDefault(); applyRange('custom'); }} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <CalendarDays className="mb-3 hidden h-4 w-4 text-blue-600 sm:block" aria-hidden="true" />
                    {(['analytics_start', 'analytics_end'] as const).map(field => (
                        <div key={field} className="min-w-0 flex-1 sm:flex-none">
                            <label htmlFor={field} className="mb-1.5 block text-xs font-bold text-slate-600">{field === 'analytics_start' ? 'From' : 'To'}</label>
                            <input
                                id={field} type="date" required value={form.data[field]} max={period.today}
                                min={field === 'analytics_end' ? form.data.analytics_start : undefined}
                                onChange={event => form.setData(field, event.target.value)} disabled={form.processing}
                                aria-invalid={!!form.errors[field]} aria-describedby={form.errors[field] ? `${field}-error` : undefined}
                                className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                            {form.errors[field] && <p id={`${field}-error`} role="alert" className="mt-1 max-w-64 text-xs text-red-600">{form.errors[field]}</p>}
                        </div>
                    ))}
                    <Button type="submit" disabled={form.processing} className="h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700">Apply dates</Button>
                    <p className="w-full text-xs text-slate-500">Choose up to 366 days, including both dates.</p>
                </form>
            )}
            {form.errors.analytics_range && <p role="alert" className="text-xs text-red-600">{form.errors.analytics_range}</p>}

            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(({ label, value, hint, icon: Icon, color }, index) => (
                    <div key={label} className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5">
                        <div className="flex items-center gap-2.5">
                            <span className={`rounded-xl p-2 ${color}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                            <p className="text-xs font-bold text-slate-500">{label}</p>
                        </div>
                        <p className="mt-3 break-words text-2xl font-black tabular-nums text-slate-900 sm:text-3xl">{value}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{hint}</p>
                        <AnalyticsMetricComparison current={summary[metricKeys[index]]} previous={comparison.summary[metricKeys[index]]} isDuration={metricKeys[index] === 'average_verification_hours'} />
                    </div>
                ))}
            </div>

            <p className="text-xs leading-relaxed text-slate-500">Compared with {dateLabel(comparison.period.start, true)} – {dateLabel(comparison.period.end, true)} (the same number of calendar days). {period.end === period.today && 'Today is still in progress.'}</p>

            <div className="grid min-w-0 gap-5 xl:grid-cols-3">
                <AnalyticsChartCard
                    title="Activity over time" description="Reports by submission date and missions by verification date." periodLabel={periodLabel}
                    columns={['Date', 'Reports received', 'Missions verified']}
                    rows={trend.map(day => [dateLabel(day.date, true), day.reports, day.verified])}
                    hasData={summary.reports_received + summary.missions_verified > 0} className="xl:col-span-2"
                >
                    <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Reports received</span>
                        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Missions verified</span>
                    </div>
                    <div className="h-72 min-w-0" aria-label="Daily reports received and missions verified">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} accessibilityLayer>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tickFormatter={date => dateLabel(String(date))} tick={axisStyle} tickLine={false} axisLine={false} minTickGap={35} />
                                <YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} labelFormatter={date => dateLabel(String(date), true)} />
                                <Line dataKey="reports" name="Reports received" stroke="#2563eb" strokeWidth={2.5} dot={trend.length <= 14} activeDot={{ r: 5 }} isAnimationActive={false} />
                                <Line dataKey="verified" name="Missions verified" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 3" dot={trend.length <= 14} activeDot={{ r: 5 }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </AnalyticsChartCard>

                <AnalyticsChartCard
                    title="Mission status" description="Current status of missions created in the selected period." periodLabel={periodLabel}
                    columns={['Status', 'Missions']} rows={missionData.map(item => [item.name, item.count])}
                    hasData={summary.missions_created > 0}
                >
                    <div className="relative h-56 min-w-0" aria-label="Mission status distribution">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart accessibilityLayer>
                                <Pie data={missionData.filter(item => item.count > 0)} dataKey="count" nameKey="name" innerRadius="60%" outerRadius="85%" paddingAngle={2} isAnimationActive={false}>
                                    {missionData.filter(item => item.count > 0).map(item => <Cell key={item.status} fill={item.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
                            <span className="text-3xl font-black tabular-nums text-slate-900">{countFormat.format(summary.missions_created)}</span>
                            <span className="text-xs text-slate-500">missions</span>
                        </div>
                    </div>
                    <ul className="mt-2 space-y-2">
                        {missionData.map(item => (
                            <li key={item.status} className="flex items-center justify-between gap-2 text-xs text-slate-600">
                                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill }} />{item.name}</span>
                                <span className="shrink-0 font-bold tabular-nums text-slate-800">{countFormat.format(item.count)} <span className="font-normal text-slate-400">({Math.round(item.count / Math.max(summary.missions_created, 1) * 100)}%)</span></span>
                            </li>
                        ))}
                    </ul>
                </AnalyticsChartCard>
            </div>

            <div className="grid min-w-0 gap-5 lg:grid-cols-2">
                <AnalyticsChartCard
                    title="Report categories" description="Most reported categories, ranked by reports received in this period." periodLabel={periodLabel}
                    columns={['Category', 'Reports']} rows={categories.map(item => [item.name, item.count])}
                    hasData={summary.reports_received > 0}
                >
                    <div className="max-h-80 overflow-y-auto" tabIndex={0} role="region" aria-label="Report category chart">
                        <div style={{ height: Math.max(280, categories.length * 48) }}>
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 25, left: 0, bottom: 0 }} accessibilityLayer>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" width={110} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={name => String(name).length > 16 ? `${String(name).slice(0, 15)}…` : String(name)} interval={0} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="count" name="Reports" fill="#3b82f6" radius={[0, 5, 5, 0]} maxBarSize={26} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </AnalyticsChartCard>

                <AnalyticsChartCard
                    title="Report severity" description="Urgency of reports received in the selected period." periodLabel={periodLabel}
                    columns={['Severity', 'Reports']} rows={severityData.map(item => [item.name, item.count])}
                    hasData={summary.reports_received > 0}
                >
                    <div className="h-72 min-w-0" aria-label="Report counts by severity">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={severityData} margin={{ top: 10, right: 5, left: -25, bottom: 35 }} accessibilityLayer>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={45} />
                                <YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                                <Bar dataKey="count" name="Reports" radius={[5, 5, 0, 0]} maxBarSize={48} isAnimationActive={false}>
                                    {severityData.map(item => <Cell key={item.severity} fill={item.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </AnalyticsChartCard>
            </div>
            <AnalyticsWorkload workload={workload} timezone={period.timezone} />
        </section>
    );
}
