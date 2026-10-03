import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, ClipboardList, LogOut, Shield } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import PersonnelTopBar from '@/Components/personnel/PersonnelTopBar';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { cn } from '@/Lib/utils';
import type { PageProps } from '@/Types';
import FlashToasts from '@/Components/shared/FlashToasts';

const nav = [
    { href: '/personnel/missions', label: 'My missions', icon: ClipboardList },
    { href: '/personnel/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/personnel/notifications', label: 'Notifications', icon: Bell },
];

type Props = PropsWithChildren<{
    title?: string;
}>;

export default function PersonnelLayout({ children, title = 'Mission-Lokal Personnel: My Missions' }: Props) {
    const { isActive } = useActivePath();
    const { user } = useAuth();
    const { unread_count } = usePage<PageProps & { unread_count?: number }>().props;
    const unread = unread_count ?? 0;
    const [mobileOpen, setMobileOpen] = useState(false);

    const sidebar = (
        <div className="flex h-full flex-col bg-slate-950 text-slate-300 border-r border-slate-800/80">
            <div className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/20">
                    <Shield className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-base font-black tracking-wider text-white">MISSION-LOKAL</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Field Unit Portal</p>
                </div>
            </div>

            <div className="border-b border-slate-800/60 bg-slate-900/40 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold">
                            {user?.first_name?.[0] ?? 'P'}
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                            {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : 'Personnel'}
                        </p>
                        <p className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                            {user?.account_id ?? 'PER-001'}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Field Assignments</div>
                {nav.map((item) => {
                    const isActiveLink = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
                                isActiveLink
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 font-bold translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                            )}
                        >
                            <item.icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', isActiveLink ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400')} />
                            <span className="truncate">{item.label}</span>
                            {item.href.includes('notifications') && unread > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-emerald-600 text-white text-[10px] font-extrabold px-1.5">
                                    {unread}
                                </Badge>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-800/80 p-3 bg-slate-950/60">
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                >
                    <LogOut className="h-4 w-4 shrink-0 text-slate-500" />
                    <span> Logout </span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-900/5 text-slate-900">
            <FlashToasts />
            <aside className="hidden w-64 shrink-0 flex-col lg:flex">{sidebar}</aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-64 flex-col z-10">{sidebar}</aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]">
                <PersonnelTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}