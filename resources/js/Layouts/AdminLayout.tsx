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
                    </Link>
                ))}
            </nav>
            <button
                type="button"
                onClick={() => router.post('/logout')}
                className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">
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
