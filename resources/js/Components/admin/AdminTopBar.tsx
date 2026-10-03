import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/Types';

type Props = {
    title: string;
    onMenuClick?: () => void;
};

export default function AdminTopBar({ title, onMenuClick }: Props) {
    const shortTitle = title.includes(':') ? title.split(':').pop()?.trim() ?? title : title;
    const unread = Number(usePage<PageProps>().props.unread_count ?? 0);

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 shadow-2xs">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="shrink-0 lg:hidden border-slate-200" onClick={onMenuClick}>
                    <Menu className="h-5 w-5 text-slate-700" />
                </Button>
                <div>
                    <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">
                        <span className="sm:hidden">{shortTitle}</span>
                        <span className="hidden sm:inline">{title}</span>
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-500 hidden sm:block">Municipal Operations & Triage Dashboard</p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <div className="relative hidden w-full max-w-xs md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input className="pl-9 bg-slate-50 border-slate-200 text-xs h-9 rounded-xl" placeholder="Search mission ID or record…" readOnly />
                </div>
                
                <Button variant="outline" size="icon" className="relative border-slate-200 hover:bg-slate-50 rounded-xl" asChild>
                    <Link href="/admin/notifications">
                        <Bell className="h-4 w-4 text-slate-700" />
                        {unread > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-xs">
                                {unread > 99 ? '99+' : unread}
                            </span>
                        )}
                    </Link>
                </Button>

                <Button variant="outline" size="icon" className="hidden sm:inline-flex border-slate-200 hover:bg-slate-50 rounded-xl" asChild>
                    <Link href="/admin/settings">
                        <Settings className="h-4 w-4 text-slate-700" />
                    </Link>
                </Button>

                <Button variant="outline" size="icon" className="rounded-xl bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" asChild>
                    <Link href="/admin/settings">
                        <User className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </header>
    );
}