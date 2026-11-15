import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardAnalyticsData } from '@/Types/dashboardAnalytics';

const topicLabels: Record<string, string> = {
    drainage: 'Drainage', flood: 'Flooding', streetlight: 'Streetlights', pothole: 'Road damage',
    waste: 'Waste', noise: 'Noise', fire: 'Fire', other: 'Other concerns',
};

export default function AnalyticsHotspots({ data }: { data: DashboardAnalyticsData['hotspots'] }) {
    const [category, setCategory] = useState('all');
    const [topic, setTopic] = useState('all');
    const [search, setSearch] = useState('');
    const categories = Array.from(new Set(data.rows.map(row => row.category))).sort();
    const topics = Array.from(new Set(data.rows.filter(row => category === 'all' || row.category === category).map(row => row.topic))).sort();
    const rows = data.rows.filter(row => (category === 'all' || row.category === category)
        && (topic === 'all' || row.topic === topic) && row.area.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
    const grouped = new Map<string, { area: string; reports: number; incidents: number }>();
    rows.forEach(row => {
        const key = row.area.toLocaleLowerCase();
        const group = grouped.get(key) ?? { area: row.area, reports: 0, incidents: 0 };
        group.reports += row.reports;
        group.incidents += row.incidents;
        grouped.set(key, group);
    });
    const areas = [...grouped.values()].sort((a, b) => b.reports - a.reports).slice(0, 10);
    const metrics: [string, number][] = [['Eligible reports', data.totals.reports], ['Distinct incidents', data.totals.incidents], ['Named places', data.totals.named_areas], ['Reports without a place name', data.totals.unnamed_reports]];

    return (
        <section aria-labelledby="hotspots-heading" className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-6">
            <div>
                <h3 id="hotspots-heading" className="flex items-center gap-2 text-base font-black text-slate-900"><MapPin className="h-5 w-5 text-blue-600" /> Most reported places</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">Explore street and landmark hotspots for the selected date range. Reports count submissions; incidents combine only staff-confirmed merges. Suggested duplicates remain separate.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {metrics.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-3"><p className="text-[11px] font-bold text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value}</p></div>)}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-xs font-bold text-slate-700">Concern category
                    <select value={category} onChange={event => { setCategory(event.target.value); setTopic('all'); }} className="block min-h-10 w-full rounded-xl border border-slate-300 bg-white text-sm">
                        <option value="all">All categories</option>{categories.map(name => <option key={name}>{name}</option>)}
                    </select>
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Concern type
                    <select value={topic} onChange={event => setTopic(event.target.value)} className="block min-h-10 w-full rounded-xl border border-slate-300 bg-white text-sm">
                        <option value="all">All concern types</option>{topics.map(key => <option key={key} value={key}>{topicLabels[key] ?? key}</option>)}
                    </select>
                </label>
                <label className="space-y-1 text-xs font-bold text-slate-700">Street or landmark
                    <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search places" type="search" className="block min-h-10 w-full rounded-xl border border-slate-300 text-sm" />
                </label>
            </div>
            {areas.length > 0 && <>
                <div className="flex flex-wrap gap-4 text-xs text-slate-600"><span>Blue: resident reports</span><span>Teal: distinct incidents</span></div>
                <div className="h-80" aria-label="Top ten places by report count">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={areas} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }} accessibilityLayer>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="area" type="category" width={125} tick={{ fontSize: 11 }} /><Tooltip />
                            <Bar dataKey="reports" name="Resident reports" fill="#2563eb" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                            <Bar dataKey="incidents" name="Distinct incidents" fill="#14b8a6" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </>}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[640px] text-left text-xs">
                    <caption className="sr-only">Reports by place, category and concern type</caption>
                    <thead className="bg-slate-50 text-slate-600"><tr>{['Place', 'Category / type', 'Reports', 'Incidents', 'Unique reporters', 'Open incidents'].map(label => <th key={label} scope="col" className="px-4 py-3 font-bold">{label}</th>)}</tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map(row => <tr key={row.key}><th scope="row" className="px-4 py-3 font-semibold text-slate-900">{row.area}</th><td className="px-4 py-3 text-slate-600">{row.category}<span className="block text-[11px]">{topicLabels[row.topic] ?? row.topic}</span></td><td className="px-4 py-3">{row.reports}</td><td className="px-4 py-3">{row.incidents}</td><td className="px-4 py-3">{row.unique_reporters}</td><td className="px-4 py-3">{row.open_incidents}</td></tr>)}
                        {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No eligible reports match these filters.</td></tr>}
                    </tbody>
                </table>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">Hotspots include analyzed public concerns. Private and sensitive cases, pending submissions, spam and rejected reports are excluded. The summary cards cover all eligible reports in the date range; the filters narrow the chart and table.</p>
        </section>
    );
}
