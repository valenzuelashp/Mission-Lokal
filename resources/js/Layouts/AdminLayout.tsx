import { CalendarDays, ClipboardList, FileText, LayoutDashboard, LogOut, Map, Megaphone, Menu, UserCircle, Users, ShieldAlert, CheckSquare, BookOpen, ShieldCheck, ChevronDown, ChevronRight, ChevronLeft, ScrollText } from 'lucide-react';
import { PropsWithChildren, useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminNotificationDrawer from '@/Components/admin/AdminNotificationDrawer';
import ProfilePhotoPicker from '@/Components/shared/ProfilePhotoPicker';
import UserAvatar from '@/Components/shared/UserAvatar';
import AdminTopBar from '@/Components/admin/AdminTopBar';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { cn } from '@/Lib/utils';
import { useActivePath } from '@/Hooks/useActivePath';
import type { PageProps } from '@/Types';
import FlashToasts from '@/Components/shared/FlashToasts';

interface NavItem {
    href: string;
    label: string;
    icon: any;
    exact?: boolean;
}

interface NavSection {
    id: string;
    title: string;
    icon: any;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        id: 'operations',
        title: 'Operations',
        icon: ShieldAlert,
        items: [
            { href: '/admin/reports', label: 'Report queue', icon: FileText },
            { href: '/admin/missions', label: 'Mission queue', icon: ClipboardList },
            { href: '/admin/blotters', label: 'Blotters', icon: ShieldAlert },
            { href: '/admin/map', label: 'Map operations', icon: Map },
        ],
    },
    {
        id: 'users',
        title: 'Users',
        icon: Users,
        items: [
            { href: '/admin/personnel', label: 'Personnel', icon: Users },
            { href: '/admin/residents', label: 'Residents', icon: Users },
            { href: '/admin/verifications', label: 'Verifications', icon: CheckSquare },
            { href: '/admin/profile-edits', label: 'Profile Requests', icon: UserCircle },
        ],
    },
    {
        id: 'communications',
        title: 'Communications',
        icon: Megaphone,
        items: [
            { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
            { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
            { href: '/admin/library', label: 'Library', icon: BookOpen },
            { href: '/admin/documents', label: 'Documents', icon: ScrollText },
        ],
    },
    {
        id: 'system',
        title: 'System',
        icon: ShieldCheck,
        items: [
            { href: '/admin/audit', label: 'Audit Logs', icon: ShieldCheck },
        ],
    },
];

type Props = PropsWithChildren<{
    title?: string;
}>;

export default function AdminLayout({ children, title = 'Mission-Lokal Admin: Dashboard' }: Props) {
    const { isActive } = useActivePath();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [clearedUnread, setClearedUnread] = useState(false);
    
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
    
    const serverUnread = Number(unread_count ?? 0);
    const unread = clearedUnread ? 0 : serverUnread;

    useEffect(() => {
        setClearedUnread(false);
    }, [serverUnread]);

    const openNotifications = () => {
        setMobileOpen(false);
        setNotificationsOpen(true);
    };
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

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const initialOpenState: Record<string, boolean> = {};
        navSections.forEach(section => {
            const hasActiveChild = section.items.some(item => active(item.href, item.exact));
            if (hasActiveChild) {
                initialOpenState[section.id] = true;
            }
        });
        setOpenSections(prev => ({ ...initialOpenState, ...prev }));
    }, []);

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getItemBadgeCount = (href: string) => {
        if (href.includes('reports')) return pendingReports;
        if (href.includes('missions')) return pendingMissions;
        if (href.includes('verifications')) return pendingRegistrations;
        if (href.includes('blotters')) return pendingBlotters;
        if (href.includes('map')) return pendingMapAlerts;
        if (href.includes('profile-edits')) return pendingProfileEdits;
        if (href.includes('notifications')) return unread;
        return 0;
    };

    const getSectionBadgeCount = (section: NavSection) => {
        return section.items.reduce((acc, item) => acc + getItemBadgeCount(item.href), 0);
    };

    const renderBadge = (href: string, isActiveLink: boolean) => {
        const count = getItemBadgeCount(href);
        if (count <= 0) return null;

        let badgeStyle = 'bg-sky-100 text-sky-800 border-sky-200';
        if (href.includes('reports') || href.includes('map')) badgeStyle = 'bg-rose-100 text-rose-700 border-rose-200';
        if (href.includes('missions')) badgeStyle = 'bg-amber-100 text-amber-700 border-amber-200';
        if (href.includes('blotters')) badgeStyle = 'bg-indigo-100 text-indigo-700 border-indigo-200';

        return (
            <Badge className={cn('ml-auto h-5 min-w-5 justify-center text-[10px] font-bold px-1.5', isActiveLink ? 'bg-white text-sky-700' : badgeStyle)}>
                {count > 99 ? '99+' : count}
            </Badge>
        );
    };

    const sidebarContent = (isMobile = false) => (
        <div className={cn(
            "flex h-full flex-col bg-[#f0f6fc] text-slate-700 border-r border-sky-100/90 shadow-[1px_0_6px_rgba(56,189,248,0.05)] transition-all duration-300 relative overflow-visible",
            !isMobile && collapsed ? "w-20" : "w-64"
        )}>
            {/* Collapse Toggle Button */}
            {!isMobile && (
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute -right-3.5 top-[6.50rem] -translate-y-1/2 hidden h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white shadow-md hover:bg-sky-600 lg:flex z-30 cursor-pointer transition-transform hover:scale-105"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            )}

            {/* Header / Brand */}
            <div className={cn(
                "flex items-center shrink-0 border-b border-sky-100/90 py-4 bg-white/70 backdrop-blur-xs",
                !isMobile && collapsed ? "justify-center px-3" : "justify-between px-5"
            )}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-sky-100">
                        <img 
                            src="/images/barangay-tambo-logo.png" 
                            alt="Barangay Tambo Logo" 
                            className="h-full w-full object-contain"
                        />
                    </div>
                    {(!collapsed || isMobile) && (
                        <div className="min-w-0 overflow-hidden">
                            <p className="text-base font-black tracking-tight text-slate-900 truncate">MISSION-LOKAL</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 truncate">Command Core</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Pill */}
            <div className={cn(
                "shrink-0 border-b border-sky-100/80 bg-white/40 py-3.5",
                !isMobile && collapsed ? "px-3 flex justify-center" : "px-5"
            )}>
                {(!collapsed || isMobile) ? (
                    <div className="space-y-2">
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-800">
                                {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : 'Administrator'}
                            </p>
                            <p className="truncate font-mono text-[10px] uppercase tracking-wider text-sky-700/70">
                                {user?.account_id ?? 'CMD-001'}
                            </p>
                        </div>
                        <ProfilePhotoPicker
                            fallback="A"
                            avatarClassName="h-9 w-9 rounded-lg border border-sky-200/80 bg-sky-100 text-sm font-bold text-sky-700 shadow-2xs"
                        />
                    </div>
                ) : (
                    <UserAvatar
                        src={user?.profile_photo_url}
                        name={user?.first_name}
                        fallback="A"
                        className="h-9 w-9 rounded-lg border border-sky-200/80 bg-sky-100 text-sm font-bold text-sky-700 shadow-2xs"
                    />
                )}
            </div>

            {/* Navigation Accordion - Scrollable Area */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 admin-sidebar-scrollbar">
                <Link
                    href="/admin"
                    title={!isMobile && collapsed ? 'Dashboard' : undefined}
                    className={cn(
                        'group flex items-center rounded-xl text-xs font-semibold transition-all duration-150',
                        !isMobile && collapsed ? 'justify-center p-2.5' : 'w-full gap-3 px-3.5 py-2.5',
                        active('/admin', true)
                            ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/25'
                            : 'text-slate-600 hover:bg-white/80 hover:text-sky-900',
                    )}
                >
                    <LayoutDashboard className={cn(
                        'h-4 w-4 shrink-0',
                        active('/admin', true) ? 'text-white' : 'text-sky-600/70 group-hover:text-sky-700',
                    )} />
                    {(!collapsed || isMobile) && <span>Dashboard</span>}
                </Link>

                {navSections.map((section) => {
                    const isSectionOpen = !!openSections[section.id];
                    const hasActiveChild = section.items.some(item => active(item.href, item.exact));
                    const sectionBadgeCount = getSectionBadgeCount(section);

                    if (!isMobile && collapsed) {
                        return (
                            <div key={section.id} className="space-y-1">
                                {section.items.map((item) => {
                                    const isNotifications = item.href === '/admin/notifications';
                                    const isActiveLink = active(item.href, item.exact) || (isNotifications && notificationsOpen);
                                    const className = cn(
                                        'group flex items-center justify-center rounded-xl p-2.5 text-xs font-semibold transition-all duration-150',
                                        isActiveLink
                                            ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/25'
                                            : 'text-slate-600 hover:bg-white/80 hover:text-sky-900',
                                    );
                                    const icon = <item.icon className={cn('h-4 w-4 shrink-0', isActiveLink ? 'text-white' : 'text-sky-600/70 group-hover:text-sky-700')} />;

                                    if (isNotifications) {
                                        return (
                                            <button key={item.href} type="button" title={item.label} onClick={openNotifications} className={className}>
                                                {icon}
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link key={item.href} href={item.href} title={item.label} className={className}>
                                            {icon}
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    }

                    return (
                        <div key={section.id} className="space-y-1">
                            {/* Main Dropdown Header */}
                            <button
                                type="button"
                                onClick={() => toggleSection(section.id)}
                                className={cn(
                                    'group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer',
                                    hasActiveChild
                                        ? 'bg-white/90 text-sky-900 font-bold shadow-2xs'
                                        : 'text-slate-600 hover:bg-white/80 hover:text-sky-900'
                                )}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <section.icon className={cn('h-4 w-4 shrink-0 transition-colors', hasActiveChild ? 'text-sky-600' : 'text-sky-600/70 group-hover:text-sky-700')} />
                                    <span className="truncate">{section.title}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {!isSectionOpen && sectionBadgeCount > 0 && (
                                        <Badge className="h-4 min-w-4 justify-center text-[9px] font-bold px-1 bg-rose-500 text-white">
                                            {sectionBadgeCount > 99 ? '99+' : sectionBadgeCount}
                                        </Badge>
                                    )}
                                    {isSectionOpen ? (
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-700 transition-transform" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-700 transition-transform" />
                                    )}
                                </div>
                            </button>

                            {/* Subtabs / Dropdown Content */}
                            {isSectionOpen && (
                                <div className="pl-3.5 space-y-1 pt-0.5 border-l-2 border-sky-200/80 ml-4">
                                    {section.items.map((item) => {
                                        const isNotifications = item.href === '/admin/notifications';
                                        const isActiveLink = active(item.href, item.exact) || (isNotifications && notificationsOpen);
                                        const className = cn(
                                            'group flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-left text-xs font-semibold transition-all duration-150',
                                            isActiveLink
                                                ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/25'
                                                : 'text-slate-600 hover:bg-white/80 hover:text-sky-900',
                                        );
                                        const content = (
                                            <>
                                                <item.icon
                                                    className={cn(
                                                        'h-4 w-4 shrink-0 transition-colors',
                                                        isActiveLink ? 'text-white' : 'text-sky-600/70 group-hover:text-sky-700',
                                                    )}
                                                />
                                                <span className="truncate">{item.label}</span>
                                                {renderBadge(item.href, isActiveLink)}
                                            </>
                                        );

                                        if (isNotifications) {
                                            return (
                                                <button key={item.href} type="button" onClick={openNotifications} className={className}>
                                                    {content}
                                                </button>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => isMobile && setMobileOpen(false)}
                                                className={className}
                                            >
                                                {content}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Logout Footer - Permanently Pinned at Bottom */}
            <div className="shrink-0 border-t border-sky-100/80 p-3 bg-white/40">
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer",
                        !isMobile && collapsed ? "justify-center px-2" : ""
                    )}
                    title={!isMobile && collapsed ? "Logout" : undefined}
                >
                    <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
                    {(!collapsed || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc] text-slate-900">
            <style>{`
                .admin-sidebar-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .admin-sidebar-scrollbar::-webkit-scrollbar-track {
                    background: rgba(224, 242, 254, 0.4);
                    border-radius: 9999px;
                }
                .admin-sidebar-scrollbar::-webkit-scrollbar-thumb {
                    background: #38bdf8;
                    border-radius: 9999px;
                }
                .admin-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #0284c7;
                }
                .admin-sidebar-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #38bdf8 rgba(224, 242, 254, 0.4);
                }
            `}</style>

            <FlashToasts />
            <aside className={cn(
                "hidden h-full shrink-0 flex-col lg:flex transition-all duration-300 overflow-visible z-20",
                collapsed ? "w-20" : "w-64"
            )}>
                {sidebarContent(false)}
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs transition-opacity"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-64 flex-col z-10">
                        {sidebarContent(true)}
                    </aside>
                </div>
            )}

            <div className="flex h-full min-w-0 flex-1 flex-col bg-white overflow-hidden">
                <AdminTopBar
                    title={title}
                    unreadCount={unread}
                    onMenuClick={() => setMobileOpen(true)}
                    onNotificationsClick={openNotifications}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] p-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-5 md:px-6 md:pt-6 lg:p-8">{children}</main>
            </div>
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-sky-100 bg-white/95 shadow-xl backdrop-blur-md lg:hidden">
                <div className="flex items-stretch justify-around px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                    {[
                        { href: '/admin', label: 'Home', icon: LayoutDashboard },
                        { href: '/admin/reports', label: 'Reports', icon: FileText },
                        { href: '/admin/missions', label: 'Missions', icon: ClipboardList },
                        { href: '/admin/blotters', label: 'Blotters', icon: ShieldAlert },
                    ].map(({ href, label, icon: Icon }) => {
                        const current = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    'flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-[10px] font-black uppercase tracking-wider',
                                    current ? 'bg-sky-50 text-sky-700' : 'text-slate-400',
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className="truncate">{label}</span>
                            </Link>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400"
                    >
                        <Menu className="h-5 w-5 shrink-0" />
                        <span>Menu</span>
                    </button>
                </div>
            </nav>
            <AdminNotificationDrawer
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onLoaded={() => setClearedUnread(true)}
            />
        </div>
    );
}