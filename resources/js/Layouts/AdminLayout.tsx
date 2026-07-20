import { Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    FileText,
    LayoutDashboard,
    LogOut,
    Map,
    Megaphone,
    UserCircle,
    Users,
} from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import AdminTopBar from '@/Components/admin/AdminTopBar';
import { useAuth } from '@/Hooks/usePageProps';
import { cn } from '@/Lib/utils';
import { useActivePath } from '@/Hooks/useActivePath';

const nav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/reports', label: 'Report queue', icon: FileText },
    { href: '/admin/missions', label: 'Mission queue', icon: ClipboardList },
    { href: '/admin/map', label: 'Map', icon: Map },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/admin/residents', label: 'Residents', icon: Users },
];

type Props = PropsWithChildren<{
    title?: string;
}>;

export default function AdminLayout({ children, title = 'Mission-Lokal Admin: Dashboard' }: Props) {
    const { isActive } = useActivePath();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const active = (href: string, exact?: boolean) => {
        if (exact) return isActive('/admin') && href === '/admin';
        return isActive(href);
    };

    const sidebar = (
        <div className="flex h-full flex-col bg-neutral-50/40 backdrop-blur-md">
            <div className="border-b border-neutral-200/60 px-5 py-5 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-neutral-950 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-widest text-neutral-900">Mission-Lokal</p>
            </div>
            
            <div className="border-b border-neutral-200/40 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm">
                        <UserCircle className="h-5 w-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-neutral-900 uppercase tracking-tight truncate">Command Center</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-0.5 truncate">
                            {user?.account_id ?? 'Admin'}
                        </p>
                    </div>
                </div>
            </div>
            
            <nav className="flex flex-1 flex-col gap-1.5 p-4">
                {nav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200',
                            active(item.href, item.exact)
                                ? 'bg-neutral-900 text-white shadow-sm border border-transparent'
                                : 'text-neutral-500 border border-transparent hover:bg-white hover:text-neutral-900 hover:border-neutral-200/60',
                        )}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
            
            <div className="p-4 border-t border-neutral-200/40">
                <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-black uppercase tracking-widest text-neutral-500 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#fbfbfa] font-sans text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[45rem] h-[45rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-50" />
            </div>

            <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200/60 bg-white/60 backdrop-blur-md lg:flex z-10">{sidebar}</aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-neutral-950/20 backdrop-blur-xs transition-opacity"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative flex h-full w-64 flex-col border-r border-neutral-200 bg-white">{sidebar}</aside>
                </div>
            )}

            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                <AdminTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}