export default function FormProgress({ current, total, labels }: { current: number; total: number; labels?: string[] }) {
    const percent = Math.max(0, Math.min(100, (current / total) * 100));

    return (
        <div aria-label={`Step ${current} of ${total}`} className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <span>Step {current} of {total}</span>
                <span>{Math.round(percent)}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total}>
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
            {labels && (
                <ol className="grid gap-2 text-xs sm:grid-cols-3">
                    {labels.map((label, index) => (
                        <li key={label} className={index + 1 <= current ? 'font-bold text-cyan-700 dark:text-cyan-300' : 'text-slate-400'}>{index + 1}. {label}</li>
                    ))}
                </ol>
            )}
        </div>
    );
}
