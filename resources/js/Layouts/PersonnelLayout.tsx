import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CalendarDays, ClipboardList, Clock3, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropsWithChildren, useEffect, useState } from 'react';
import PersonnelTopBar from '@/Components/personnel/PersonnelTopBar';
import ProfilePhotoPicker from '@/Components/shared/ProfilePhotoPicker';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { cn } from '@/Lib/utils';
import type { PageProps } from '@/Types';
import FlashToasts from '@/Components/shared/FlashToasts';
import { personnelDepartments, type PersonnelDepartmentKey } from '@/Lib/personnelDepartments';

const nav = [
    { href: '/personnel/missions', label: 'Department missions', icon: ClipboardList },
    { href: '/personnel/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/personnel/notifications', label: 'Notifications', icon: Bell },
];

type Props = PropsWithChildren<{
    title?: string;
}>;

export default function PersonnelLayout({ children, title = 'Mission-Lokal Personnel: Missions' }: Props) {
    const { isActive } = useActivePath();
    const { user } = useAuth();
    const { unread_count, personnel_department: personnelDepartment, personnel_shift: personnelShift } = usePage<PageProps & { unread_count?: number }>().props;
    const departmentTheme = personnelDepartment?.value
        ? personnelDepartments[personnelDepartment.value as PersonnelDepartmentKey]
        : null;
    const DepartmentIcon = departmentTheme?.icon ?? Shield;
    const accent = departmentTheme?.theme.accent ?? 'bg-blue-700';
    const accentHover = departmentTheme?.theme.accentHover ?? 'hover:bg-blue-800';
    const sidebarTheme = departmentTheme?.theme.sidebar ?? 'bg-[#eaf1fb] text-slate-800 border-blue-200/80';
    const pageTheme = departmentTheme?.theme.background ?? 'bg-[#eef3fb]';
    const unread = unread_count ?? 0;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        const updateTime = () => setCurrentTime(new Date());
        updateTime();
        const interval = window.setInterval(updateTime, 1000);

        return () => window.clearInterval(interval);
    }, []);

    const timeParts = currentTime
        ? new Intl.DateTimeFormat('en-PH', {
            timeZone: 'Asia/Manila',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(currentTime)
        : [];
    const hour = Number(timeParts.find((part) => part.type === 'hour')?.value);
    const minute = Number(timeParts.find((part) => part.type === 'minute')?.value);
    const minutes = currentTime ? hour * 60 + minute : null;
    const currentShift = minutes === null
        ? null
        : minutes >= 8 * 60 && minutes < 16 * 60
            ? 'morning'
            : minutes >= 16 * 60
                ? 'evening'
                : 'overnight';
    const isOnShift = Boolean(
        personnelShift?.is_active &&
        personnelShift.value &&
        personnelShift.value === currentShift,
    );
    const timeLabel = currentTime
        ? new Intl.DateTimeFormat('en-PH', {
            timeZone: 'Asia/Manila',
            hour: 'numeric',
            minute: '2-digit',
            hourCycle: 'h12',
        }).format(currentTime)
        : '--:--';

    const sidebar = (
        <div className={cn(
            "flex h-full flex-col border-r shadow-sm transition-all duration-300 relative",
            sidebarTheme,
            collapsed ? "w-20" : "w-72"
        )}>
            {/* Collapse Toggle Button */}
            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn("absolute -right-3.5 top-7 hidden h-7 w-7 items-center justify-center rounded-full text-white shadow-md lg:flex z-30 cursor-pointer transition-transform hover:scale-105", accent, accentHover)}
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Brand Header */}
            <div className={cn("flex items-center gap-3.5 border-b border-white/15 py-5 bg-white/10 backdrop-blur-md transition-all shrink-0", collapsed ? "justify-center px-4" : "px-7")}>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md", accent)}>
                    <DepartmentIcon className="h-6 w-6" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className={cn("text-base font-black tracking-wider truncate", departmentTheme ? "text-white" : "text-slate-900")}>MISSION-LOKAL</p>
                        <p className="text-[10px] font-extrabold uppercase tracking-widest mt-0.5 truncate opacity-80">Department Portal</p>
                    </div>
                )}
            </div>

            {/* User Profile Pill */}
            {!collapsed && (
                <div className="border-b border-white/15 bg-white/10 px-6 py-4 backdrop-blur-md shrink-0">
                    <div className="space-y-2">
                        <div className="min-w-0">
                            <p className={cn("truncate text-sm font-black", departmentTheme ? "text-white" : "text-slate-900")}>
                                {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}` : 'Personnel'}
                            </p>
                            <p className="mt-0.5 truncate font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
                                {personnelDepartment?.role
                                    ? `${personnelDepartment.role} · ${user?.account_id ?? 'PER-001'}`
                                    : user?.account_id ?? 'PER-001'}
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
                {!collapsed && <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest opacity-60">Department Queue</div>}
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
                                    ? cn(accent, 'text-white shadow-md translate-x-1')
                                    : 'opacity-75 hover:bg-white/10 hover:opacity-100',
                            )}
                        >
                            <item.icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-110', isActiveLink ? 'text-white' : 'opacity-70')} />
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
            <div className="shrink-0 border-t border-white/15 p-3 bg-white/10">
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    title={collapsed ? "Logout Session" : undefined}
                    className={cn(
                        "flex w-full items-center rounded-2xl text-xs font-black transition-colors hover:bg-rose-500/20 hover:text-rose-100 cursor-pointer",
                        collapsed ? "justify-center p-3.5" : "gap-3.5 px-4 py-2.5"
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0 opacity-70" />
                    {!collapsed && <span>Logout Session</span>}
                </button>
            </div>
        </div>
    );
    const departmentHeroStyle = departmentTheme
        ? {
            backgroundImage: `linear-gradient(90deg, rgba(2, 6, 23, 0.96) 0%, rgba(2, 6, 23, 0.82) 42%, rgba(2, 6, 23, 0.2) 100%), url("${departmentTheme.image}")`,
        }
        : undefined;

    return (
        <div className={cn("flex h-screen overflow-hidden text-slate-900 w-full antialiased", pageTheme, departmentTheme?.theme.ring ?? 'selection:bg-blue-100 selection:text-blue-900')}>
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

            <div className={cn("flex h-full min-w-0 flex-1 flex-col w-full overflow-hidden", pageTheme)}>
                <PersonnelTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 w-full overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 max-w-7xl mx-auto space-y-6">
                    {personnelDepartment?.label && (
                        <section
                            className="relative isolate min-h-[260px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 bg-cover bg-center text-white shadow-xl sm:min-h-[300px]"
                            style={departmentHeroStyle}
                        >
                            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/75 via-transparent to-white/5" />
                            <div className="flex min-h-[260px] flex-col justify-between gap-8 p-6 sm:min-h-[300px] sm:p-9 lg:p-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
                                        <span className={cn('h-2 w-2 rounded-full shadow-[0_0_12px_currentColor]', departmentTheme?.heroAccent)} />
                                        Department operations
                                    </div>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="text-right">
                                            <p className="flex items-center justify-end gap-2 text-sm font-black text-white sm:text-lg">
                                                <Clock3 className="h-4 w-4 shrink-0 text-white/80 sm:h-5 sm:w-5" />
                                                <span>Shift: {personnelShift?.hours ?? 'Not assigned'}</span>
                                            </p>
                                            {personnelShift?.value && (
                                                <p className={cn(
                                                    'mt-1 text-[10px] font-bold sm:text-xs',
                                                    isOnShift ? 'text-emerald-300' : 'text-white/55',
                                                )}>
                                                    {isOnShift ? 'On shift' : 'Off shift'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md sm:flex">
                                            <DepartmentIcon className="h-7 w-7" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="max-w-2xl">
                                        <p className={cn('text-[11px] font-black uppercase tracking-[0.22em]', departmentTheme?.heroAccent)}>
                                            {departmentTheme?.heroEyebrow}
                                        </p>
                                        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                                            {personnelDepartment.label}
                                        </h1>
                                        <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-white/80 sm:text-base">
                                            {personnelDepartment.description}
                                        </p>
                                        <div className="mt-5 flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/45 px-3 py-2 text-[11px] font-bold text-white/90 backdrop-blur-sm">
                                                <DepartmentIcon className="h-3.5 w-3.5" />
                                                {personnelDepartment.role ?? 'Department member'}
                                            </span>
                                            <span className="rounded-xl border border-white/15 bg-slate-950/45 px-3 py-2 text-[11px] font-semibold text-white/75 backdrop-blur-sm">
                                                Barangay Tambo response network
                                            </span>
                                        </div>
                                        {personnelDepartment.value === 'peace_order' && (
                                            <p className="mt-4 inline-flex max-w-xl items-center gap-2 rounded-xl border border-rose-200/30 bg-rose-950/55 px-3 py-2 text-[11px] font-bold text-rose-100 backdrop-blur-sm">
                                                <Shield className="h-4 w-4 shrink-0" />
                                                VAWC details are confidential and visible only to authorized VAW Desk personnel.
                                            </p>
                                        )}
                                    </div>
                                    <time
                                        className="shrink-0 self-end pb-1 text-5xl font-black leading-none tracking-tight text-white sm:text-6xl lg:text-7xl"
                                        aria-label={`Current Philippines time ${timeLabel}`}
                                    >
                                        {timeLabel}
                                    </time>
                                </div>
                            </div>
                        </section>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}