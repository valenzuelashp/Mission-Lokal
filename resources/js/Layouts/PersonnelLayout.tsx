import { Link, router, usePage } from '@inertiajs/react';
import { Bell, ClipboardList, LogOut, UserCircle } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import PersonnelTopBar from '@/Components/personnel/PersonnelTopBar';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { cn } from '@/Lib/utils';
import type { PageProps } from '@/Types';

const nav = [
    { href: '/personnel/missions', label: 'My missions', icon: ClipboardList },
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
                        <p className="text-xs font-black text-neutral-900 uppercase tracking-tight truncate">Field operations</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-0.5 truncate">
                            {user?.account_id ?? 'Personnel'}
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
                            isActive(item.href)
                                ? 'bg-neutral-900 text-white shadow-sm border border-transparent'
                                : 'text-neutral-500 border border-transparent hover:bg-white hover:text-neutral-900 hover:border-neutral-200/60',
                        )}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.href.includes('notifications') && unread > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center rounded-lg border border-neutral-200 bg-white px-1 text-[10px] font-black text-neutral-900 shadow-sm">{unread}</Badge>
                        )}
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
            {/* Soft Ambient Vector Backdrop */}
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
                <PersonnelTopBar title={title} onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}