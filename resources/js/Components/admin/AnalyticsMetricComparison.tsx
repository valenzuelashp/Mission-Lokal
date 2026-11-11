import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function AnalyticsMetricComparison({ current, previous, isDuration = false }: {
    current: number | null;
    previous: number | null;
    isDuration?: boolean;
}) {
    const difference = current !== null && previous !== null ? current - previous : null;
    const Icon = difference === null || difference === 0 ? Minus : difference > 0 ? ArrowUpRight : ArrowDownRight;
    const color = isDuration && difference !== null && difference !== 0
        ? difference < 0 ? 'text-emerald-700' : 'text-amber-700'
        : 'text-slate-600';
    let change = 'No change';
    if (current === null) change = 'No verified missions this period';
    else if (previous === null) change = 'No previous verified missions';
    else if (previous === 0 && current !== 0) change = isDuration ? 'Previous average was 0 hrs' : 'No activity in previous period';
    else if (difference !== 0 && difference !== null) {
        const percent = (Math.abs(difference) / previous * 100).toLocaleString('en-PH', { maximumFractionDigits: 1 });
        const direction = isDuration ? difference < 0 ? 'less time' : 'more time' : difference < 0 ? 'fewer' : 'more';
        change = `${percent}% ${direction}`;
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] leading-relaxed">
            <p className="text-slate-500">Previous: <span className="font-semibold tabular-nums text-slate-700">{previous === null ? '—' : `${previous.toLocaleString('en-PH')}${isDuration ? ' hrs' : ''}`}</span></p>
            <p className={`mt-1 flex items-start gap-1 font-semibold ${color}`}>
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{change}
            </p>
        </div>
    );
}
