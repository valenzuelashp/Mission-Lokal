import { Head } from '@inertiajs/react';
import { Award, CalendarDays, Download, Medal, Trophy, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import PdfPngDownloadButton from '@/Components/shared/PdfPngDownloadButton';

type BadgeItem = { id: string; name: string; threshold: number; earned_xp: number };
type Resident = {
    id: string;
    rank: number;
    name: string;
    account_id: string;
    civic_xp: number;
    badges: BadgeItem[];
};

type MonthOption = { value: string; label: string };

export default function CivicRecognitionIndex({ residents, month, months, ranking_source, ranking_has_activity }: {
    residents: Resident[];
    month: string;
    months: MonthOption[];
    ranking_source: 'live' | 'snapshot' | 'reconstructed';
    ranking_has_activity: boolean;
}) {
    const earnedBadgeCount = residents.reduce((total, resident) => total + resident.badges.length, 0);
    const rankingDescription = !ranking_has_activity
        ? 'No Civic XP activity was recorded for this month.'
        : ranking_source === 'snapshot'
        ? 'Archived month-end ranking.'
        : ranking_source === 'live'
            ? 'Live ranking for the current month.'
            : ranking_has_activity
                ? 'Reconstructed from XP events and saved for future views.'
                : 'No activity records exist for this month; displayed scores are the 50 XP starting balance.';

    return (
        <AdminLayout title="Civic Recognition">
            <Head title="Civic Recognition" />
            <main className="w-full space-y-6 pb-12">
                <header className="flex flex-col gap-3 border-b border-slate-200/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-800">
                            <Award className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-cyan-800">Resident engagement</p>
                            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Civic recognition</h1>
                            <p className="mt-1 text-sm font-medium text-slate-500">Monthly rankings, earned badges, and certificates</p>
                        </div>
                    </div>
                </header>

                <form method="get" action="/admin/civic-recognition" className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
                    <div className="mr-auto flex items-center gap-2 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-4 w-4 text-cyan-700" />Ranking period
                    </div>
                    <label className="grid gap-1 text-xs font-bold text-slate-600">
                        Ranking month
                        <select name="month" defaultValue={month} className="h-10 min-w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/15">
                            {months.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                    <Button type="submit" variant="outline" className="h-10 rounded-xl">View month</Button>
                </form>

                <p role="status" className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-xs font-semibold text-cyan-950">
                    {rankingDescription}
                </p>

                <section aria-label="Selected month overview" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Users className="h-4 w-4 text-cyan-700" />Residents ranked</p>
                        <p className="mt-2 font-mono text-2xl font-black text-slate-900">{residents.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Trophy className="h-4 w-4 text-amber-600" />Top monthly score</p>
                        <p className="mt-2 font-mono text-2xl font-black text-slate-900">{residents[0]?.civic_xp ?? '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Award className="h-4 w-4 text-cyan-700" />Badges earned this month</p>
                        <p className="mt-2 font-mono text-2xl font-black text-slate-900">{earnedBadgeCount}</p>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                        <h2 className="text-sm font-black uppercase tracking-wide text-slate-800">Monthly resident ranking</h2>
                        <span className="text-xs font-medium text-slate-500">{months.find((option) => option.value === month)?.label ?? month}</span>
                    </div>
                    {residents.length === 0 ? (
                        <p className="px-5 py-12 text-center text-sm font-medium text-slate-500">No residents are listed because no Civic XP events or badges were recorded for this month.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                                    <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Resident</th><th className="px-4 py-3 text-right">XP</th><th className="px-4 py-3">Badges</th><th className="px-4 py-3">Certificates</th></tr>
                                </thead>
                                <tbody>
                                    {residents.map((resident) => (
                                        <tr key={resident.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-600">
                                                    {resident.rank <= 3 && <Medal className="h-4 w-4 text-amber-600" />}{resident.rank}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="block font-bold text-slate-900">{resident.name}</span>
                                                <span className="mt-0.5 block font-mono text-xs text-slate-500">{resident.account_id}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono font-black text-cyan-900">{resident.civic_xp}</td>
                                            <td className="px-4 py-3.5">
                                                {resident.badges.length ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {resident.badges.map((badge) => <span key={badge.id} className="inline-flex items-center gap-1 rounded-lg border border-cyan-100 bg-cyan-50 px-2 py-1 text-[11px] font-bold text-cyan-900"><Award className="h-3 w-3" />{badge.name}</span>)}
                                                    </div>
                                                ) : <span className="text-xs text-slate-400">No badge</span>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {resident.badges.map((badge) => (
                                                        <span key={badge.id} className="inline-flex items-center gap-1">
                                                            <a href={`/admin/civic-recognition/${resident.id}/certificate?month=${month}&badge_id=${badge.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-700 hover:border-cyan-200 hover:bg-cyan-50" aria-label={`Download ${badge.name} certificate PDF for ${resident.name}`} title={`Download ${badge.name} certificate PDF`}>
                                                                <Download className="h-3.5 w-3.5" />PDF
                                                            </a>
                                                            <PdfPngDownloadButton
                                                                pdfUrl={`/admin/civic-recognition/${resident.id}/certificate?month=${month}&badge_id=${badge.id}`}
                                                                fileName={`civic-recognition-${resident.account_id}-${badge.id}`}
                                                                label="PNG"
                                                                className="h-8 rounded-lg px-2.5"
                                                            />
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </AdminLayout>
    );
}