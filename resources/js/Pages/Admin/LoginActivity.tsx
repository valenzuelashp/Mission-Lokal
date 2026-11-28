import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

type Filters = { search?: string; role?: string; from?: string; to?: string };
type Log = { id: string; account_id: string; user_name: string; role: string; signed_in_at: string; ip_address: string | null; browser: string; device: string; approximate_location: string; user_agent: string };
type Props = { logs: { data: Log[]; links: { url: string | null; label: string; active: boolean }[] }; filters: Filters };

export default function LoginActivity({ logs, filters }: Props) {
    const { data, setData, get, processing } = useForm({ search: filters.search || '', role: filters.role || '', from: filters.from || '', to: filters.to || '' });
    return <AdminLayout title="Login Activity"><Head title="Login Activity" />
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold">Login Activity</h1><p className="mt-2 text-sm text-slate-500">Successful sign-ins for admin and department staff accounts in your barangay. Locations are approximate and may reflect a VPN or network provider.</p></div>
            <form onSubmit={event => { event.preventDefault(); get('/admin/login-activity', { preserveState: true }); }} className="flex flex-wrap items-end gap-3">
                <label className="text-xs font-semibold">Account or name<Input value={data.search} onChange={event => setData('search', event.target.value)} placeholder="Search accounts" /></label>
                <label className="text-xs font-semibold">Role<select value={data.role} onChange={event => setData('role', event.target.value)} className="mt-1 block h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900"><option value="">Admin &amp; department staff</option><option value="personnel">Department staff</option><option value="admin">Admin</option></select></label>
                <label className="text-xs font-semibold">From<Input type="date" value={data.from} onChange={event => setData('from', event.target.value)} /></label>
                <label className="text-xs font-semibold">To<Input type="date" value={data.to} onChange={event => setData('to', event.target.value)} /></label>
                <Button disabled={processing}>Apply filters</Button><Link href="/admin/login-activity" className="p-2 text-sm text-blue-700">Reset</Link>
            </form>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr>{['Signed in', 'Account', 'Role', 'IP address', 'Browser / device', 'Approximate location'].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
                    <tbody>{logs.data.map(log => <tr key={log.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="whitespace-nowrap p-4">{new Date(log.signed_in_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}<span className="block text-xs text-slate-500">Philippine time</span></td>
                        <td className="p-4"><span className="block font-semibold">{log.user_name}</span><span className="text-xs text-slate-500">{log.account_id}</span></td>
                        <td className="p-4 capitalize">{log.role}</td><td className="p-4 font-mono text-xs">{log.ip_address || 'Unknown'}</td>
                        <td className="p-4" title={log.user_agent}>{log.browser} / {log.device}</td><td className="p-4">{log.approximate_location || 'Unknown'}</td>
                    </tr>)}{logs.data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No sign-ins match these filters.</td></tr>}</tbody>
                </table>
            </div>
            <nav aria-label="Login activity pages" className="flex flex-wrap gap-2">{logs.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded-lg border px-3 py-2 text-sm ${link.active ? 'bg-blue-700 text-white' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded-lg border px-3 py-2 text-sm opacity-40" dangerouslySetInnerHTML={{ __html: link.label }} />)}</nav>
        </div>
    </AdminLayout>;
}
