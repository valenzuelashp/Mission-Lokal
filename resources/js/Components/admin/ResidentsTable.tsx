import { Link } from '@inertiajs/react';
import { Award, ChevronRight } from 'lucide-react';
import ResidentCard from '@/Components/admin/ResidentCard';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { AdminResident, VerificationStatus } from '@/Types';

const statusLabel: Record<VerificationStatus, string> = {
    approved: 'Verified',
    pending: 'Pending',
    in_progress: 'ID review',
    rejected: 'Rejected',
};

const statusStyle: Record<VerificationStatus, string> = {
    approved: 'bg-neutral-900 text-white border-transparent shadow-xs',
    pending: 'bg-white border-neutral-200 text-neutral-500',
    in_progress: 'bg-neutral-50 border-neutral-200/60 text-neutral-600',
    rejected: 'bg-neutral-100 border-neutral-200 text-neutral-400 opacity-60 line-through',
};

type Props = {
    residents: AdminResident[];
};

export default function ResidentsTable({ residents }: Props) {
    if (residents.length === 0) {
        return (
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/30 rounded-2xl border border-dashed border-neutral-200">
                Zero entries match the indexed lookup trace.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {residents.map((resident) => (
                    <ResidentCard key={resident.id} resident={resident} />
                ))}
            </div>

            <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm md:block">
                <table className="w-full min-w-[960px] text-xs font-bold tracking-tight text-neutral-700">
                    <thead>
                        <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            <th className="px-5 py-4 w-[30%]">Resident profile node</th>
                            <th className="px-5 py-4">Account ID</th>
                            <th className="px-5 py-4">Communication metrics</th>
                            <th className="px-5 py-4">Verification protocol</th>
                            <th className="px-5 py-4">Civic weight</th>
                            <th className="px-5 py-4">Index filed</th>
                            <th className="px-5 py-4">Joined framework</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {residents.map((row) => (
                            <tr key={row.id} className="group transition-colors hover:bg-neutral-50/40">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 font-black text-neutral-800 shadow-3xs">
                                            {row.full_name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .slice(0, 2)
                                                .join('')}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-neutral-900 leading-snug">{row.full_name}</p>
                                            <p className="truncate text-[11px] font-medium text-neutral-400 mt-0.5 leading-tight">{row.address}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4 font-mono text-[11px] tracking-wide text-neutral-900">{row.account_id}</td>
                                <td className="px-5 py-4">
                                    <p className="text-neutral-900 font-bold tabular-nums">{row.mobile ?? '—'}</p>
                                    <p className="truncate text-[11px] font-medium text-neutral-400 mt-0.5 leading-none">{row.email ?? '—'}</p>
                                </td>
                                <td className="px-5 py-4">
                                    <Badge className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all ${statusStyle[row.verification_status]}`}>
                                        {statusLabel[row.verification_status]}
                                    </Badge>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1 font-black text-neutral-900 bg-neutral-100 border border-neutral-200 rounded-lg px-2 py-0.5 shadow-2xs transform scale-95 origin-left">
                                        <Award className="h-3.5 w-3.5 stroke-[2.5]" />
                                        {row.civic_xp}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-neutral-500 font-bold tabular-nums pr-6">{row.report_count}</td>
                                <td className="px-5 py-4 text-neutral-400 font-medium tabular-nums">{row.joined_at}</td>
                                <td className="px-5 py-4 text-right">
                                    <Button size="sm" variant="outline" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-900 transition-all active:scale-95" asChild>
                                        <Link href={`/admin/residents/${row.id}`}>
                                            Inspect
                                            <ChevronRight className="ml-0.5 h-3.5 w-3.5 stroke-[2.5]" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}