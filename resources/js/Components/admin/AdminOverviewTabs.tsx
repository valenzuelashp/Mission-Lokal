import { Link } from '@inertiajs/react';
import { ChartNoAxesCombined, LayoutDashboard } from 'lucide-react';
import { cn } from '@/Lib/utils';

export default function AdminOverviewTabs({ active }: { active: 'dashboard' | 'analytics' }) {
    return (
        <nav aria-label="Overview pages" className="flex w-fit max-w-full gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs">
            {[
                { id: 'dashboard', href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'analytics', href: '/admin/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
            ].map(({ id, href, label, icon: Icon }) => (
                <Link key={id} href={href} aria-current={active === id ? 'page' : undefined}
                    className={cn('flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                        active === id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-700')}>
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{label}
                </Link>
            ))}
        </nav>
    );
}
