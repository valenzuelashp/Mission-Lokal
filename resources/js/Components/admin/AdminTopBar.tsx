import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/Types';

type Props = {
    title: string;
    unreadCount?: number;
    onMenuClick?: () => void;
    onNotificationsClick?: () => void;
};

export default function AdminTopBar({ title, unreadCount, onMenuClick, onNotificationsClick }: Props) {
    const shortTitle = title.includes(':') ? title.split(':').pop()?.trim() ?? title : title;
    const unread = unreadCount ?? Number(usePage<PageProps>().props.unread_count ?? 0);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md shadow-2xs sm:gap-4 sm:px-8 sm:py-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden border-slate-200 rounded-xl" onClick={onMenuClick}>
                    <Menu className="h-5 w-5 text-slate-700" />
                </Button>
                <div>
                    <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-xl">
                        <span className="sm:hidden">{shortTitle}</span>
                        <span className="hidden sm:inline">{title}</span>
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-400 hidden sm:block">Barangay Operations & Triage Dashboard</p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <div className="relative hidden w-full max-w-xs md:block">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="pl-10 bg-slate-50/70 border-slate-200 text-xs h-10 rounded-2xl shadow-none" placeholder="Search mission ID or record…" readOnly />
                </div>
                
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="relative border-slate-200 hover:bg-slate-50 rounded-2xl h-10 w-10 shadow-2xs"
                    aria-label="Notifications"
                    onClick={onNotificationsClick}
                >
                    <Bell className="h-4 w-4 text-slate-700" />
                    {unread > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </Button>

                <Button variant="outline" size="icon" className="hidden sm:inline-flex border-slate-200 hover:bg-slate-50 rounded-2xl h-10 w-10 shadow-2xs" asChild>
                    <Link href="/admin/settings">
                        <Settings className="h-4 w-4 text-slate-700" />
                    </Link>
                </Button>

                <Button variant="outline" size="icon" className="rounded-2xl h-10 w-10 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-2xs" asChild>
                    <Link href="/admin/settings">
                        <User className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </header>
    );
}