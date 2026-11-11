import { useId, useRef, type ReactNode } from 'react';
import { BarChart3, Table2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface Props {
    title: string;
    description: string;
    columns: string[];
    rows: (string | number)[][];
    periodLabel: string;
    hasData: boolean;
    children: ReactNode;
    className?: string;
    emptyTitle?: string;
    emptyDescription?: string;
}

export default function AnalyticsChartCard({ title, description, columns, rows, periodLabel, hasData, children, className = '', emptyTitle = 'No activity in this period', emptyDescription = 'Try another date range to see more data.' }: Props) {
    const dialog = useRef<HTMLDialogElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    return (
        <Card className={`min-w-0 overflow-hidden rounded-3xl border-slate-200/80 bg-white shadow-2xs ${className}`}>
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6">
                <CardTitle className="text-sm font-extrabold text-slate-900">{title}</CardTitle>
                <p className="text-xs leading-relaxed text-slate-500">{description}</p>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
                {hasData ? children : (
                    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 px-6 text-center">
                        <BarChart3 className="h-8 w-8 text-slate-300" aria-hidden="true" />
                        <p className="text-sm font-semibold text-slate-600">{emptyTitle}</p>
                        <p className="text-xs text-slate-500">{emptyDescription}</p>
                    </div>
                )}
                <div className="mt-4 border-t border-slate-100 pt-3">
                    <button ref={trigger} type="button" onClick={() => dialog.current?.showModal()} aria-haspopup="dialog"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                        <Table2 className="h-4 w-4" aria-hidden="true" />View data table<span className="sr-only"> for {title}</span>
                    </button>
                </div>
                <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
                    onClose={() => trigger.current?.focus({ preventScroll: true })}
                    onKeyDown={event => {
                        if (event.key === 'Escape') {
                            event.preventDefault();
                            event.currentTarget.close();
                        }
                    }}
                    onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
                    className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm sm:m-auto sm:h-auto sm:max-h-[85dvh] sm:w-[90vw] sm:max-w-4xl sm:rounded-3xl">
                    <div className="flex h-full flex-col sm:h-auto sm:max-h-[85dvh]">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
                            <div className="min-w-0">
                                <h2 id={titleId} className="text-lg font-black text-slate-900">{title}</h2>
                                <p id={descriptionId} className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
                                <p className="mt-2 text-xs font-semibold text-blue-700">{periodLabel}</p>
                            </div>
                            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close data table"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-auto" tabIndex={0} role="region" aria-label={`${title} data`}>
                            <table className="w-full text-left text-sm">
                                <caption className="sr-only">{title}. {description} {periodLabel}</caption>
                                <thead className="sticky top-0 z-10 bg-slate-50 text-xs text-slate-600">
                                    <tr>{columns.map((column, cell) => <th key={column} scope="col" className={`px-5 py-3 font-bold sm:px-6 ${cell > 0 ? 'text-right' : ''}`}>{column}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {rows.length ? rows.map((row, index) => (
                                        <tr key={index} className="hover:bg-blue-50/50">{row.map((value, cell) => cell === 0
                                            ? <th key={cell} scope="row" className="px-5 py-3 font-medium sm:px-6">{value}</th>
                                            : <td key={cell} className="px-5 py-3 text-right tabular-nums sm:px-6">{typeof value === 'number' ? value.toLocaleString() : value}</td>)}</tr>
                                    )) : <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">No records to display.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                            <span className="text-xs text-slate-500">{rows.length.toLocaleString()} {rows.length === 1 ? 'row' : 'rows'}</span>
                            <button type="button" onClick={() => dialog.current?.close()} className="min-h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Done</button>
                        </div>
                    </div>
                </dialog>
            </CardContent>
        </Card>
    );
}
