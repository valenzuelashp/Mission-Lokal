import { Link, usePage } from '@inertiajs/react';
import { Search, ShieldCheck, Bell } from 'lucide-react'; // <-- Added Bell icon
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge'; // <-- Added Badge component
import { useAuth } from '@/Hooks/usePageProps';
import type { PageProps } from '@/Types';

export default function ResidentHeader() {
    const { user } = useAuth();
    // Grab the global unread_count passed from the HandleInertiaRequests middleware
    const { unread_count } = usePage<PageProps & { unread_count?: number }>().props;
    const unread = unread_count ?? 0;
    
    const initials = user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
            <div className="flex h-14 w-full items-center gap-3 px-4 xl:px-8">
                <Link href="/feed" className="flex shrink-0 items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        ML
                    </div>
                    <span className="hidden font-bold text-primary sm:inline">Mission-Lokal</span>
                </Link>

                <div className="relative hidden max-w-xs flex-1 md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        className="h-9 rounded-full bg-[#f0f2f5] pl-9"
                        placeholder="Search concerns…"
                        readOnly
                    />
                </div>

                <div className="ml-auto flex items-center gap-2 sm:gap-4">
                    <Link 
                        href="/blotters" 
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        My Records
                    </Link>

                    {/* NEW: Notification Bell with Badge */}
                    <Link 
                        href="/notifications" 
                        className="relative flex items-center justify-center h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
                    >
                        <Bell className="h-5 w-5" />
                        {unread > 0 && (
                            <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] bg-red-600 text-white">
                                {unread > 99 ? '99+' : unread}
                            </Badge>
                        )}
                    </Link>

                    {user && (
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 rounded-full bg-[#f0f2f5] py-1 pl-1 pr-3"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                                {initials}
                            </span>
                            <span className="hidden text-xs font-semibold sm:inline">{user.civic_xp} XP</span>
                        </Link>
                    )}
                    <ResidentLogoutButton variant="icon" />
                </div>
            </div>
        </header>
    );
}