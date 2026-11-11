import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, ClipboardCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnalyticsChartCard from '@/Components/admin/AnalyticsChartCard';
import type { DepartmentWorkload } from '@/Types/dashboardAnalytics';

export default function AnalyticsWorkload({ workload, timezone }: { workload: DepartmentWorkload; timezone: string }) {
    const asOf = new Date(workload.as_of).toLocaleString('en-PH', {
        timeZone: timezone, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
    const periodLabel = `Current workload · As of ${asOf} · ${timezone}`;
    const attentionCards = [
        { label: 'Overdue missions', count: workload.totals.overdue, hint: 'Active missions past their due date or flagged overdue.', href: '/admin/missions?filter=past_due', icon: AlertTriangle, color: 'bg-rose-50 text-rose-700', action: 'Review past-due missions' },
        { label: 'Awaiting verification', count: workload.totals.awaiting_verification, hint: 'Completed missions waiting for admin verification.', href: '/admin/missions?filter=completed', icon: ClipboardCheck, color: 'bg-amber-50 text-amber-700', action: 'Review completed missions' },
    ];
    const segments = [
        { key: 'active', label: 'Active', color: '#3b82f6' },
        { key: 'overdue', label: 'Overdue', color: '#e11d48' },
        { key: 'awaiting_verification', label: 'Awaiting verification', color: '#f59e0b' },
    ];

    return (
        <section aria-labelledby="workload-heading" className="space-y-4 border-t border-slate-200 pt-6">
            <div>
                <h2 id="workload-heading" className="flex items-center gap-2 text-lg font-black text-slate-900"><Users className="h-5 w-5 text-blue-600" aria-hidden="true" />Current workload</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Across all dates, independent of the analytics date filter. Updated {asOf} ({timezone}).</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {attentionCards.map(({ label, count, hint, href, icon: Icon, color, action }) => (
                    <Link key={label} href={href} className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition-colors hover:border-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                        <div className="flex items-center justify-between gap-3">
                            <span className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${color}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</span>
                            <span className="text-3xl font-black tabular-nums text-slate-900">{count.toLocaleString('en-PH')}</span>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-slate-500">{hint}</p>
                        <span className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700">{action}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
                    </Link>
                ))}
            </div>
            <AnalyticsChartCard
                title="Department workload" description="Outstanding missions by department. Each mission appears in one segment; overdue missions are shown separately from other active work."
                periodLabel={periodLabel} columns={['Department', 'Active', 'Overdue', 'Awaiting verification', 'Total']}
                rows={workload.departments.map(item => [item.name, item.active, item.overdue, item.awaiting_verification, item.total])}
                hasData={workload.departments.length > 0}
                emptyTitle="No outstanding missions" emptyDescription="Active missions and work awaiting verification will appear here."
            >
                <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-600">
                    {segments.map(item => <span key={item.key} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>)}
                </div>
                <div className="max-h-[28rem] overflow-y-auto" tabIndex={0} role="region" aria-label="Department workload chart">
                    <div style={{ height: Math.max(280, workload.departments.length * 52) }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={workload.departments} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }} accessibilityLayer>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval={0} tickFormatter={name => String(name).length > 17 ? `${String(name).slice(0, 16)}…` : String(name)} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} cursor={{ fill: '#f1f5f9' }} />
                                {segments.map(item => <Bar key={item.key} dataKey={item.key} name={item.label} stackId="workload" fill={item.color} maxBarSize={28} isAnimationActive={false} />)}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </AnalyticsChartCard>
        </section>
    );
}
