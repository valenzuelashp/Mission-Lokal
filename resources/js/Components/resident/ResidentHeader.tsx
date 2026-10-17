import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Search, ShieldCheck, Bell, CircleHelp } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import ThemePickerModal from '@/Components/resident/ThemePickerModal';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

export default function ResidentHeader() {
    const { user } = useAuth();
    const theme = useResidentTheme();
    const { unread_count } = usePage<PageProps & { unread_count?: number }>().props;
    const unread = unread_count ?? 0;
    
    const initials = user?.first_name?.[0] ?? user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <header className={`sticky top-0 z-50 border-b ${theme.cardBorder} ${theme.cardBg}/95 backdrop-blur-md shadow-2xs`}>
            <div className="flex h-14 w-full min-w-0 items-center gap-1.5 px-3 sm:h-16 sm:gap-3 sm:px-4 xl:px-8">
                <Link href="/feed" className="flex shrink-0 items-center gap-2.5 group">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl sm:h-10 sm:w-10 ${theme.primaryBg} text-sm font-black text-white shadow-md group-hover:scale-105 transition-transform`}>
                        ML
                    </div>
                    <span className={`hidden font-black tracking-tight text-base md:inline ${theme.textMain}`}>MISSION-LOKAL</span>
                </Link>

                <div className="relative hidden max-w-sm flex-1 md:block">
                    <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`} />
                    <Input
                        className={`h-10 rounded-xl pl-10 text-xs font-medium ${theme.inputBg} ${theme.inputBorder} ${theme.inputText}`}
                        placeholder="Search community concerns…"
                        readOnly
                    />
                </div>

                <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-2">
                    <ThemePickerModal />

                    <Link
                        href="/calendar"
                        className={`hidden h-10 w-10 items-center justify-center rounded-xl md:flex ${theme.textMuted} hover:opacity-100 hover:bg-slate-100/50 transition-colors`}
                        aria-label="Calendar"
                    >
                        <CalendarDays className="h-5 w-5" />
                    </Link>

                    <Link 
                        href="/blotters" 
                        className={`hidden sm:flex items-center gap-1.5 text-xs font-bold ${theme.textMuted} hover:opacity-100 transition-colors`}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        My Records
                    </Link>

                    <Link 
                        href="/help" 
                        className={`hidden sm:flex items-center gap-1.5 text-xs font-bold ${theme.textMuted} transition-colors`}
                    >
                        <CircleHelp className="h-4 w-4" />
                        Help
                    </Link>

                    <Link 
                        href="/notifications" 
                        className={`relative flex items-center justify-center h-10 w-10 rounded-xl ${theme.textMuted} hover:opacity-100 hover:bg-slate-100/50 transition-colors`}
                    >
                        <Bell className="h-5 w-5" />
                        {unread > 0 && (
                            <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-black bg-red-600 text-white border-2 border-white">
                                {unread > 99 ? '99+' : unread}
                            </Badge>
                        )}
                    </Link>

                    {user && (
                        <Link
                            href="/profile"
                            className={`flex items-center gap-2 rounded-xl py-1 pl-1 pr-1.5 transition-colors border sm:pl-1.5 sm:pr-3.5 ${theme.cardBorder} ${theme.hoverBg}`}
                        >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-7 sm:w-7 ${theme.primaryBg} text-xs font-black text-white`}>
                                {initials}
                            </span>
                            <span className={`hidden text-xs font-extrabold ${theme.primaryText} sm:inline`}>{user.civic_xp ?? 0} XP</span>
                        </Link>
                    )}
                    <ResidentLogoutButton variant="icon" />
                </div>
            </div>
        </header>
    );
}