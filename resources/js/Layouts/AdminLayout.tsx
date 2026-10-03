import { CalendarDays, ClipboardList, FileText, LayoutDashboard, LogOut, Map, Megaphone, UserCircle, Users, ShieldAlert, Bell, CheckSquare, BookOpen, ShieldCheck, Command } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminTopBar from '@/Components/admin/AdminTopBar';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { cn } from '@/Lib/utils';
import { useActivePath } from '@/Hooks/useActivePath';
import type { PageProps } from '@/Types';
import FlashToasts from '@/Components/shared/FlashToasts';

const nav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/reports', label: 'Report queue', icon: FileText },
    { href: '/admin/missions', label: 'Mission queue', icon: ClipboardList },
    { href: '/admin/personnel', label: 'Personnel', icon: Users },
    { href: '/admin/verifications', label: 'Verifications', icon: CheckSquare },
    { href: '/admin/blotters', label: 'Blotters', icon: ShieldAlert },
    { href: '/admin/map', label: 'Map operations', icon: Map },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/admin/library', label: 'Library', icon: BookOpen },
    { href: '/admin/residents', label: 'Residents', icon: Users },
    { href: '/admin/profile-edits', label: 'Profile Requests', icon: UserCircle },
    { href: '/admin/audit', label: 'Audit Logs', icon: ShieldCheck },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

type Props = PropsWithChildren<{
    title?: string;
}>;

export default function AdminLayout({ children, title = 'Mission-Lokal Admin: Dashboard' }: Props) {
    const { isActive } = useActivePath();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    
    const { 
        unread_count, 
        pending_registrations_count,
        pending_reports_count,
        pending_missions_count,
        pending_blotters_count,
        pending_profile_edits_count,
        pending_map_alerts_count
    } = usePage<PageProps & { 
        unread_count?: number; 
        pending_registrations_count?: number;
        pending_reports_count?: number;
        pending_missions_count?: number;
        pending_blotters_count?: number;
        pending_profile_edits_count?: number;
        pending_map_alerts_count?: number;
    }>().props;
    
    const unread = Number(unread_count ?? 0);
    const pendingRegistrations = Number(pending_registrations_count ?? 0);
    const pendingReports = Number(pending_reports_count ?? 0);
    const pendingMissions = Number(pending_missions_count ?? 0);
    const pendingBlotters = Number(pending_blotters_count ?? 0);
    const pendingProfileEdits = Number(pending_profile_edits_count ?? 0);
    const pendingMapAlerts = Number(pending_map_alerts_count ?? 0);

    const active = (href: string, exact?: boolean) => {
        if (exact) return isActive('/admin') && href === '/admin';
        return isActive(href);
    };

    const sidebar = (
        <div className="flex h-full flex-col bg-slate-950 text-slate-300 border-r border-slate-800/80">
            <div className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/20">
                    <Command className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-base font-black tracking-wider text-white">MISSION-LOKAL</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Command Core</p>
                </div>
            </div>

            <div className="border-b border-slate-800/60 bg-slate-900/40 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold">
                            {user?.first_name?.[0] ?? 'A'}
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                            {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : 'Administrator'}
                        </p>
                        <p className="font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                            {user?.account_id ?? 'CMD-001'}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Operations Navigation</div>
                {nav.map((item) => {
                    const isActiveLink = active(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150',
                                isActiveLink
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold translate-x-1'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-white',
                            )}
                        >
                            <item.icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', isActiveLink ? 'text-white' : 'text-slate-500 group-hover:text-blue-400')} />
                            <span className="truncate">{item.label}</span>
                            
                            {item.href.includes('reports') && pendingReports > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-red-600 text-white text-[10px] font-extrabold px-1.5">
                                    {pendingReports > 99 ? '99+' : pendingReports}
                                </Badge>
                            )}
                            {item.href.includes('missions') && pendingMissions > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-red-600 text-white text-[10px] font-extrabold px-1.5">
                                    {pendingMissions > 99 ? '99+' : pendingMissions}
                                </Badge>
                            )}
                            {item.href.includes('verifications') && pendingRegistrations > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-amber-600 text-white text-[10px] font-extrabold px-1.5">
                                    {pendingRegistrations > 99 ? '99+' : pendingRegistrations}
                                </Badge>
                            )}
                            {item.href.includes('blotters') && pendingBlotters > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-indigo-600 text-white text-[10px] font-extrabold px-1.5">
                                    {pendingBlotters > 99 ? '99+' : pendingBlotters}
                                </Badge>
                            )}
                            {item.href.includes('map') && pendingMapAlerts > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-rose-600 text-white text-[10px] font-extrabold px-1.5">
                                    {pendingMapAlerts > 99 ? '99+' : pendingMapAlerts}
                                </Badge>
                            )}
                            {item.href.includes('profile-edits') && pendingProfileEdits > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-blue-600 text-white text-[10px] font-extrabold px-1.5">
                                    {pendingProfileEdits > 99 ? '99+' : pendingProfileEdits}
                                </Badge>
                            )}
                            {item.href.includes('notifications') && unread > 0 && (
                                <Badge className="ml-auto h-5 min-w-5 justify-center bg-blue-600 text-white text-[10px] font-extrabold px-1.5">
                                    {unread > 99 ? '99+' : unread}
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
                <AdminTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}