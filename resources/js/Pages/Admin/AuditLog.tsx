import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Search, Activity, Cpu } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';

interface LogItem {
    id: string;
    action: string;
    entity: string;
    actor: string;
    actor_email: string;
    details: string;
    timestamp: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    logs: {
        data: LogItem[];
        links: PaginationLinks[];
    };
}

export default function AuditLog({ logs }: Props) {
    const [search, setSearch] = useState('');
    const logItems = logs?.data || [];

    const filteredLogs = useMemo(() => {
        const q = search.toLowerCase();
        return logItems.filter(log => 
            log.action.toLowerCase().includes(q) ||
            log.entity.toLowerCase().includes(q) ||
            log.actor.toLowerCase().includes(q) ||
            log.details.toLowerCase().includes(q)
        );
    }, [logItems, search]);

    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('DELETE') || act.includes('REJECT')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (act.includes('CREATE') || act.includes('APPROVE') || act.includes('VERIFY')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (act.includes('UPDATE')) return 'bg-amber-50 text-amber-800 border-amber-200';
        return 'bg-blue-50 text-blue-700 border-blue-200';
    };

    return (
        <AdminLayout title="System Security Audit Trail">
            <Head title="Security Audit Log" />

            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <ShieldCheck className="h-3 w-3" /> Security Surveillance
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <ShieldCheck className="h-7 w-7 text-blue-600" /> Security Audit Trail
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Real-time immutable activity log monitoring admin modifications, security overrides, and database transactions.
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="pl-10 bg-white text-xs h-11 border-slate-200 focus:bg-white transition-colors rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                        placeholder="Search logs by action, admin, or entity..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Audit Logs Table Card */}
                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {filteredLogs.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground text-xs font-semibold flex flex-col items-center justify-center space-y-3">
                                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <Activity className="h-6 w-6 text-slate-300 animate-pulse" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">No system modifications indexed in the active lookback window.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-black uppercase tracking-wider text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 w-40">Timestamp</th>
                                            <th className="px-5 py-4 w-48">Action Event</th>
                                            <th className="px-5 py-4 w-60">Administrative Actor</th>
                                            <th className="px-6 py-4">Operation Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-xs">
                                        {filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/75 transition-colors">
                                                <td className="px-6 py-4 text-slate-500 font-mono">
                                                    {log.timestamp}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-black font-mono border shadow-2xs ${getActionBadgeColor(log.action)}`}>
                                                            {log.action}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 font-semibold">
                                                            ({log.entity})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-slate-900 font-extrabold flex items-center gap-2">
                                                        {log.actor.includes('System') && <Cpu className="h-4 w-4 text-blue-600" />}
                                                        {log.actor}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{log.actor_email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 max-w-sm md:max-w-xl truncate font-medium">
                                                    {log.details}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination Links */}
                {logs?.links && logs.links.length > 3 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {logs.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                only={['logs']}
                                disabled={!link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                                    link.active 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 disabled:opacity-40 disabled:pointer-events-none'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}