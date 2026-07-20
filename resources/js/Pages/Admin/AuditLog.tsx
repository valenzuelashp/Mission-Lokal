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

    // Color mapper pill badges based on severity/actions executed
    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('DELETE') || act.includes('REJECT')) return 'bg-red-50 text-red-700 ring-red-600/20';
        if (act.includes('CREATE') || act.includes('APPROVE') || act.includes('VERIFY')) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
        if (act.includes('UPDATE')) return 'bg-amber-50 text-amber-700 ring-amber-600/20';
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
    };

    return (
        <AdminLayout title="System Security Audit Trail">
            <Head title="Security Audit Log" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-blue-900 flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-blue-700" /> Security Audit Log
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Immutable activity log monitoring modifications, resident verifications, and directory updates within this barangay's container scope.
                </p>
            </div>

            {/* Filter tools */}
            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search logs by action, admin, or records..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Main Log Record Table */}
            <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {filteredLogs.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center">
                            <Activity className="h-8 w-8 text-slate-300 animate-pulse mb-2" />
                            <p className="font-medium">No system modifications indexed in the active lookback window.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                                    <tr>
                                        <th className="p-4">Timestamp</th>
                                        <th className="p-4">Action Event</th>
                                        <th className="p-4">Administrative Actor</th>
                                        <th className="p-4">Operation Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 text-xs text-slate-500 font-mono">
                                                {log.timestamp}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold font-mono ring-1 ring-inset ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        ({log.entity})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-slate-900 flex items-center gap-1">
                                                    {log.actor.includes('System') && <Cpu className="h-3.5 w-3.5 text-blue-500" />}
                                                    {log.actor}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground font-mono">{log.actor_email}</div>
                                            </td>
                                            <td className="p-4 text-xs text-slate-600 max-w-xs md:max-w-md truncate">
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

            {/* Optimized Single Page Application Pagination Links */}
            {logs?.links && logs.links.length > 3 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                    {logs.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveScroll
                            preserveState
                            only={['logs']}
                            disabled={!link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                                link.active 
                                    ? 'bg-blue-700 text-white border-blue-700' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none'
                            }`}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}