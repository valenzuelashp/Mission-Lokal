import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, ClipboardList, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import PersonnelTopBar from '@/Components/personnel/PersonnelTopBar';
import ProfilePhotoPicker from '@/Components/shared/ProfilePhotoPicker';
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
    const [collapsed, setCollapsed] = useState(false);

    const sidebar = (
        <div className={cn(
            "flex h-full flex-col bg-[#eaf1fb] text-slate-800 border-r border-blue-200/80 shadow-sm transition-all duration-300 relative",
            collapsed ? "w-20" : "w-72"
        )}>
            {/* Collapse Toggle Button */}
            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="absolute -right-3.5 top-7 hidden h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white shadow-md hover:bg-blue-800 lg:flex z-30 cursor-pointer transition-transform hover:scale-105"
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Brand Header */}
            <div className={cn("flex items-center gap-3.5 border-b border-blue-200/70 py-5 bg-white/50 backdrop-blur-md transition-all shrink-0", collapsed ? "justify-center px-4" : "px-7")}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md shadow-blue-700/20">
                    <Shield className="h-6 w-6" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-base font-black tracking-wider text-slate-900 truncate">MISSION-LOKAL</p>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 mt-0.5 truncate">Field Unit Portal</p>
                    </div>
                )}
            </div>

            {/* User Profile Pill */}
            {!collapsed && (
                <div className="border-b border-blue-200/70 bg-white/70 px-6 py-4 backdrop-blur-md shrink-0">
                    <div className="space-y-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                                {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : 'Personnel'}
                            </p>
                            <p className="mt-0.5 truncate font-mono text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                {user?.account_id ?? 'PER-001'}
                            </p>
                        </div>
                        <ProfilePhotoPicker
                            fallback="P"
                            avatarClassName="h-11 w-11 rounded-2xl border border-blue-300 bg-blue-100 text-sm font-black text-blue-700 shadow-2xs"
                        />
                    </div>
                </div>
            )}

            {/* Navigation Links (Scrollable if needed) */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4 admin-sidebar-scrollbar">
                {!collapsed && <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Field Assignments</div>}
                {nav.map((item) => {
                    const isActiveLink = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                                'group flex items-center rounded-2xl text-xs font-black transition-all duration-200 relative',
                                collapsed ? 'justify-center p-3.5' : 'gap-3.5 px-4 py-3',
                                isActiveLink
                                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20 translate-x-1'
                                    : 'text-slate-600 hover:bg-blue-100/60 hover:text-blue-950',
                            )}
                        >
                            <item.icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', isActiveLink ? 'text-white' : 'text-slate-500 group-hover:text-blue-700')} />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {item.href.includes('notifications') && unread > 0 && (
                                <Badge className={cn("h-5 min-w-5 justify-center bg-rose-600 text-white text-[10px] font-black px-1.5 rounded-full shadow-2xs", collapsed ? "absolute -top-1 -right-1" : "ml-auto")}>
                                    {unread}
                                </Badge>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Pinned Bottom Logout Footer */}
            <div className="shrink-0 border-t border-blue-200/70 p-3 bg-white/40">
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    title={collapsed ? "Logout Session" : undefined}
                    className={cn(
                        "flex w-full items-center rounded-2xl text-xs font-black text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer",
                        collapsed ? "justify-center p-3.5" : "gap-3.5 px-4 py-2.5"
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0 text-slate-500" />
                    {!collapsed && <span>Logout Session</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#eef3fb] text-slate-900 w-full antialiased selection:bg-blue-100 selection:text-blue-900">
            <style>{`
                .admin-sidebar-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .admin-sidebar-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .admin-sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.2);
                    border-radius: 9999px;
                }
                .admin-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(59, 130, 246, 0.4);
                }
            `}</style>

            <FlashToasts />
            <aside className={cn("hidden h-full shrink-0 flex-col lg:flex shadow-md z-20 transition-all duration-300", collapsed ? "w-20" : "w-72")}>
                {sidebar}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-72 flex-col z-10 shadow-2xl">{sidebar}</aside>
                </div>
            )}

            <div className="flex h-full min-w-0 flex-1 flex-col bg-[#f4f8ff] w-full overflow-hidden">
                <PersonnelTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 w-full overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 max-w-7xl mx-auto space-y-6">{children}</main>
            </div>
        </div>
    );
}