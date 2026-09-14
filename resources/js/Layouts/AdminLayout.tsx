import { CalendarDays, ClipboardList, FileText, LayoutDashboard, LogOut, Map, Megaphone, UserCircle, Users, ShieldAlert, Bell, CheckSquare, BookOpen, ShieldCheck } from 'lucide-react';
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
    { href: '/admin/map', label: 'Map', icon: Map },
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
    
    // Safely cast props to resolve TypeScript inference conflicts
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
        <>
            <div className="border-b px-5 py-5">
                <p className="text-xl font-bold text-blue-800">Mission-Lokal</p>
            </div>
            <div className="border-b px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <UserCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Command Center</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {user?.account_id ?? 'Admin'}
                        </p>
                    </div>
                </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
                {nav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            active(item.href, item.exact)
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-white hover:text-slate-900',
                        )}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                        
                        {item.href.includes('reports') && pendingReports > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {pendingReports > 99 ? '99+' : pendingReports}
                            </Badge>
                        )}
                        {item.href.includes('missions') && pendingMissions > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {pendingMissions > 99 ? '99+' : pendingMissions}
                            </Badge>
                        )}
                        {item.href.includes('verifications') && pendingRegistrations > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {pendingRegistrations > 99 ? '99+' : pendingRegistrations}
                            </Badge>
                        )}
                        {item.href.includes('blotters') && pendingBlotters > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {pendingBlotters > 99 ? '99+' : pendingBlotters}
                            </Badge>
                        )}
                        {item.href.includes('map') && pendingMapAlerts > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {pendingMapAlerts > 99 ? '99+' : pendingMapAlerts}
                            </Badge>
                        )}
                        {item.href.includes('profile-edits') && pendingProfileEdits > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {pendingProfileEdits > 99 ? '99+' : pendingProfileEdits}
                            </Badge>
                        )}
                        {item.href.includes('notifications') && unread > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center bg-white text-red-600">
                                {unread > 99 ? '99+' : unread}
                            </Badge>
                        )}
                    </Link>
                ))}
            </nav>
            <button
                type="button"
                onClick={() => router.post('/logout')}
                className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white cursor-pointer"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FlashToasts />
            <aside className="hidden w-60 shrink-0 flex-col border-r bg-slate-100/80 lg:flex">{sidebar}</aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-60 flex-col border-r bg-slate-100/95">{sidebar}</aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <AdminTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}