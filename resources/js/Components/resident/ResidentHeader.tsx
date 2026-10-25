import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, Search, ShieldCheck, Bell, CircleHelp } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import UserAvatar from '@/Components/shared/UserAvatar';
import ThemePickerModal from '@/Components/resident/ThemePickerModal';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { useAuth } from '@/Hooks/usePageProps';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

type Props = {
    unreadCount?: number;
    onNotificationsClick?: () => void;
};

export default function ResidentHeader({ unreadCount, onNotificationsClick }: Props) {
    const { user } = useAuth();
    const theme = useResidentTheme();
    const { unread_count } = usePage<PageProps & { unread_count?: number }>().props;
    const unread = unreadCount ?? unread_count ?? 0;

    return (
        <header className={`sticky top-0 z-50 border-b ${theme.cardBorder} ${theme.cardBg}/95 backdrop-blur-md shadow-2xs w-full`}>
            <div className="flex h-16 w-full min-w-0 items-center gap-2 px-4 sm:gap-4 sm:px-6 xl:px-10">
                <Link href="/feed" className="flex shrink-0 items-center gap-3 group">
                    <img
                        src="/images/mission-lokal-logo.png"
                        alt=""
                        className="h-10 w-10 object-contain transition-transform group-hover:scale-105"
                    />
                    <span className={`hidden font-black tracking-tight text-base md:inline ${theme.textMain}`}>MISSION-LOKAL</span>
                </Link>

                <div className="relative hidden max-w-md flex-1 md:block">
                    <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`} />
                    <Input
                        className={`h-11 rounded-2xl pl-11 text-xs font-bold ${theme.inputBg} ${theme.cardBorder} ${theme.textMain} shadow-2xs`}
                        placeholder="Search community concerns…"
                        readOnly
                    />
                </div>

                <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3">
                    <ThemePickerModal />

                    <Link
                        href="/calendar"
                        className={`hidden h-11 w-11 items-center justify-center rounded-2xl md:flex ${theme.textMuted} hover:opacity-100 hover:${theme.badgeBg} transition-colors`}
                        aria-label="Calendar"
                    >
                        <CalendarDays className="h-5 w-5" />
                    </Link>

                    <Link 
                        href="/blotters" 
                        className={`hidden sm:flex items-center gap-2 text-xs font-black ${theme.textMuted} hover:opacity-100 transition-colors px-3 py-2 rounded-2xl hover:${theme.badgeBg}`}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        My Records
                    </Link>

                    <Link 
                        href="/help" 
                        className={`hidden sm:flex items-center gap-2 text-xs font-black ${theme.textMuted} transition-colors px-3 py-2 rounded-2xl hover:${theme.badgeBg}`}
                    >
                        <CircleHelp className="h-4 w-4" />
                        Help
                    </Link>

                    <button
                        type="button"
                        onClick={onNotificationsClick ?? (() => undefined)}
                        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${theme.textMuted} hover:opacity-100 hover:${theme.badgeBg}`}
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        {unread > 0 && (
                            <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-rose-600 p-0 text-[10px] font-black text-white">
                                {unread > 99 ? '99+' : unread}
                            </Badge>
                        )}
                    </button>

                    {user && (
                        <Link
                            href="/profile"
                            className={`flex items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-3 transition-colors border sm:pl-2 sm:pr-4 ${theme.cardBorder} ${theme.hoverBg}`}
                        >
                            <UserAvatar
                                src={user.profile_photo_url}
                                name={user.first_name}
                                fallback="R"
                                className={`h-8 w-8 rounded-xl text-xs font-black text-white shadow-2xs ${theme.primaryBg}`}
                            />
                            <span className={`hidden text-xs font-black ${theme.primaryText} sm:inline`}>{user.civic_xp ?? 0} XP</span>
                        </Link>
                    )}
                    <ResidentLogoutButton variant="icon" />
                </div>
            </div>
        </header>
    );
}