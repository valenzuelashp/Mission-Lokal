import { Head } from '@inertiajs/react';
import { CalendarDays, Download, FileText } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import PdfPngDownloadButton from '@/Components/shared/PdfPngDownloadButton';

type Props = {
    barangay: { name: string; code: string; address: string; contact_email?: string; contact_phone?: string };
    period: { quarter: number; year: number; start: string; end: string };
    generated_at: string;
    years: number[];
    summary: Record<string, number | null>;
    categories: { category: string; total: number }[];
    severities: { severity: string; total: number }[];
    blotter_statuses: { status: string; total: number }[];
};

const metricLabels: [keyof Props['summary'], string][] = [
    ['concerns_received', 'Concerns received'],
    ['concerns_resolved', 'Resolved / closed'],
    ['concerns_in_progress', 'Under review / active'],
    ['concerns_pending', 'Awaiting review'],
    ['concerns_rejected', 'Rejected / spam'],
    ['missions_assigned', 'Missions assigned'],
    ['missions_verified', 'Missions verified'],
    ['blotters_received', 'Blotters received'],
];

export default function DilgReportIndex(props: Props) {
    const pdfUrl = `/admin/reports/dilg/pdf?quarter=${props.period.quarter}&year=${props.period.year}`;

    return (
        <AdminLayout title="Quarterly DILG Report">
            <Head title="Quarterly Report" />
            <main className="w-full space-y-6 pb-12">
                <header className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-800">
                            <FileText className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-800">Barangay reporting</p>
                            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Quarterly incident report</h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">{props.barangay.name} · Q{props.period.quarter} {props.period.year} · {props.period.start} to {props.period.end}</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Button asChild className="bg-cyan-800 text-white hover:bg-cyan-900">
                            <a href={pdfUrl}><Download className="h-4 w-4" />Download PDF</a>
                        </Button>
                        <PdfPngDownloadButton pdfUrl={pdfUrl} fileName={`barangay-quarterly-report-Q${props.period.quarter}-${props.period.year}`} />
                    </div>
                </header>

                <form method="get" action="/admin/reports/dilg" className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
                    <div className="mr-auto flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-4 w-4 text-cyan-700" />Reporting period
                    </div>
                    <label className="grid gap-1 text-xs font-bold text-slate-600">
                        Quarter
                        <select name="quarter" defaultValue={props.period.quarter} className="h-10 min-w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15">
                            <option value="1">Q1 · January to March</option>
                            <option value="2">Q2 · April to June</option>
                            <option value="3">Q3 · July to September</option>
                            <option value="4">Q4 · October to December</option>
                        </select>
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-slate-600">
                        Year
                        <select name="year" defaultValue={props.period.year} className="h-10 min-w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15">
                            {props.years.map((year) => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </label>
                    <Button type="submit" variant="outline" className="h-10 rounded-xl">Apply period</Button>
                </form>

                <section aria-label="Quarterly totals" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {metricLabels.map(([key, label]) => (
                        <div key={key} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
                            <p className="text-xs font-bold text-slate-500">{label}</p>
                            <p className="mt-2 font-mono text-2xl font-black text-slate-900">{props.summary[key] ?? 0}</p>
                        </div>
                    ))}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
                        <p className="text-xs font-bold text-slate-500">Average time to verified completion</p>
                        <p className="mt-2 font-mono text-2xl font-black text-slate-900">{props.summary.average_resolution_hours ?? '—'} <span className="text-sm font-bold">hrs</span></p>
                    </div>
                </section>
                <p className="-mt-3 text-xs font-medium text-slate-500">Concern and blotter status totals are current values for cases received this quarter, as of report generation.</p>

                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">Quarterly breakdown</h2>
                        <span className="text-xs font-medium text-slate-500">Aggregate records only</span>
                    </div>
                    <div className="grid gap-6 p-5 md:grid-cols-2 sm:p-6">
                        <div>
                            <h3 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-wide text-slate-700">Concerns by category</h3>
                            <table className="mt-2 w-full text-left text-sm">
                                <tbody>{props.categories.length ? props.categories.map((row) => <tr key={row.category} className="border-b border-slate-100"><th className="py-2.5 font-semibold text-slate-700">{row.category}</th><td className="py-2.5 text-right font-mono font-bold text-slate-900">{row.total}</td></tr>) : <tr><td className="py-3 text-sm text-slate-500">No concerns were recorded in this period.</td></tr>}</tbody>
                            </table>
                        </div>
                        <div>
                            <h3 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-wide text-slate-700">Concerns by severity</h3>
                            <table className="mt-2 w-full text-left text-sm">
                                <tbody>{props.severities.length ? props.severities.map((row) => <tr key={row.severity} className="border-b border-slate-100"><th className="py-2.5 font-semibold capitalize text-slate-700">{row.severity}</th><td className="py-2.5 text-right font-mono font-bold text-slate-900">{row.total}</td></tr>) : <tr><td className="py-3 text-sm text-slate-500">No severity records in this period.</td></tr>}</tbody>
                            </table>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-wide text-slate-700">Blotter cases by current status</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {props.blotter_statuses.length ? props.blotter_statuses.map((row) => (
                                    <span key={row.status} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                                        <span className="capitalize">{row.status.replaceAll('_', ' ')}</span><strong className="font-mono text-slate-900">{row.total}</strong>
                                    </span>
                                )) : <p className="text-sm text-slate-500">No blotter cases were filed in this period.</p>}
                            </div>
                        </div>
                    </div>
                </section>

                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                    Working report template generated from Mission-Lokal records on {props.generated_at}. It is an aggregate operational summary, not a confirmed official DILG form. Check the latest DILG regional submission requirements and add any required signatories or forms before filing.
                </p>
            </main>
        </AdminLayout>
    );
}