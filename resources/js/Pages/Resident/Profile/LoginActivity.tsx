import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, MapPin, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';

type Login = {
    id: string;
    signed_in_at: string;
    ip_address: string | null;
    browser: string | null;
    device: string | null;
    approximate_location: string | null;
};
type Props = {
    logs: {
        data: Login[];
        total: number;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { from?: string; to?: string };
};

export default function LoginActivity({ logs, filters }: Props) {
    const theme = useResidentTheme();
    const { data, setData, get, processing, errors } = useForm({ from: filters.from || '', to: filters.to || '' });

    return <ResidentLayout>
        <Head title="Login Activity" />
        <div className="space-y-6 pt-4 sm:pt-6">
            <Button variant="ghost" asChild><Link href="/profile"><ArrowLeft className="h-4 w-4" />Back to Profile</Link></Button>
            <PageHeader title="Login Activity" description="Review successful sign-ins to your account. This history is private to your account." />

            <form onSubmit={event => { event.preventDefault(); get('/profile/login-activity', { preserveState: true, preserveScroll: true }); }}
                className={`rounded-3xl border p-5 ${theme.cardBorder} ${theme.cardBg}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="min-w-0 flex-1 space-y-2">
                        <label htmlFor="login-history-from" className={`text-xs font-bold ${theme.textMain}`}>From</label>
                        <Input id="login-history-from" type="date" value={data.from} onChange={event => setData('from', event.target.value)}
                            aria-invalid={Boolean(errors.from)} aria-describedby={errors.from ? 'login-history-from-error' : undefined}
                            className={`${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} />
                        {errors.from && <p id="login-history-from-error" role="alert" className="text-xs text-red-700">{errors.from}</p>}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <label htmlFor="login-history-to" className={`text-xs font-bold ${theme.textMain}`}>To</label>
                        <Input id="login-history-to" type="date" value={data.to} onChange={event => setData('to', event.target.value)}
                            aria-invalid={Boolean(errors.to)} aria-describedby={errors.to ? 'login-history-to-error' : undefined}
                            className={`${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`} />
                        {errors.to && <p id="login-history-to-error" role="alert" className="text-xs text-red-700">{errors.to}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={processing} className="flex-1 sm:flex-none">Apply filters</Button>
                        <Button variant="ghost" asChild><Link href="/profile/login-activity">Reset</Link></Button>
                    </div>
                </div>
            </form>

            <div className={`flex items-start gap-3 rounded-2xl border p-4 ${theme.badgeBorder} ${theme.accentSurface}`}>
                <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${theme.primaryText}`} aria-hidden="true" />
                <p className={`text-xs leading-relaxed ${theme.textMuted}`}>Times are shown in Philippine time. Locations are approximate and can reflect a VPN or network provider. An unknown location means a lookup was unavailable.</p>
            </div>

            <section aria-labelledby="recent-sign-ins-title" className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <h2 id="recent-sign-ins-title" className={`text-sm font-bold ${theme.textMain}`}>Recent sign-ins</h2>
                    <p className={`text-xs ${theme.textMuted}`}>{logs.total} {logs.total === 1 ? 'sign-in' : 'sign-ins'}</p>
                </div>
                {logs.data.length === 0
                    ? <div className={`rounded-3xl border p-8 text-center ${theme.cardBorder} ${theme.cardBg}`}>
                        <MonitorSmartphone className={`mx-auto mb-3 h-8 w-8 ${theme.primaryText}`} aria-hidden="true" />
                        <p className={`text-sm font-semibold ${theme.textMain}`}>No sign-ins found</p>
                        <p className={`mt-2 text-xs ${theme.textMuted}`}>Your successful sign-ins will appear here. Try another date range if you have applied filters.</p>
                    </div>
                    : <ul className="space-y-3">{logs.data.map(log => <li key={log.id} className={`rounded-3xl border p-5 sm:p-6 ${theme.cardBorder} ${theme.cardBg}`}>
                        <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.primaryText}`}>
                                <MonitorSmartphone className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`break-words text-sm font-bold ${theme.textMain}`}>{log.browser || 'Unknown browser'} on {log.device || 'unknown device'}</p>
                                <time dateTime={log.signed_in_at} className={`mt-1 block text-xs leading-relaxed ${theme.textMuted}`}>
                                    {new Date(log.signed_in_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })}
                                </time>
                            </div>
                        </div>
                        <dl className={`mt-4 grid gap-4 border-t pt-4 text-xs sm:grid-cols-2 ${theme.dividerColor}`}>
                            <div className="min-w-0"><dt className={theme.textMuted}>IP address</dt><dd className={`mt-1 break-all font-mono ${theme.textMain}`}>{log.ip_address || 'Unknown'}</dd></div>
                            <div className="min-w-0"><dt className={`flex items-center gap-1 ${theme.textMuted}`}><MapPin className="h-3 w-3" aria-hidden="true" />Approximate location</dt><dd className={`mt-1 break-words ${theme.textMain}`}>{log.approximate_location || 'Unknown'}</dd></div>
                        </dl>
                    </li>)}</ul>}
            </section>

            {logs.last_page > 1 && <nav aria-label="Login activity pages" className="flex flex-wrap items-center justify-between gap-3">
                {logs.prev_page_url
                    ? <Button variant="outline" asChild><Link href={logs.prev_page_url} preserveScroll>Previous</Link></Button>
                    : <Button variant="outline" disabled>Previous</Button>}
                <span className={`text-xs ${theme.textMuted}`}>Page {logs.current_page} of {logs.last_page}</span>
                {logs.next_page_url
                    ? <Button variant="outline" asChild><Link href={logs.next_page_url} preserveScroll>Next</Link></Button>
                    : <Button variant="outline" disabled>Next</Button>}
            </nav>}
        </div>
    </ResidentLayout>;
}
