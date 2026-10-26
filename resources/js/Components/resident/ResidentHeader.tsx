import { Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { CalendarDays, Search, ShieldCheck, Bell, CircleHelp, X } from 'lucide-react';
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
    const { unread_count, search: activeSearch } = usePage<PageProps & { unread_count?: number; search?: string }>().props;
    const unread = unreadCount ?? unread_count ?? 0;
    const [search, setSearch] = useState(activeSearch ?? '');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    useEffect(() => setSearch(activeSearch ?? ''), [activeSearch]);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const term = search.trim();
        setMobileSearchOpen(false);
        router.get('/feed', term ? { search: term } : {}, { preserveScroll: false, preserveState: false });
    };

    return (
        <header className={`sticky top-0 z-50 border-b ${theme.cardBorder} ${theme.cardBg} backdrop-blur-md shadow-2xs w-full`}>
            <div className="flex h-16 w-full min-w-0 items-center gap-1 px-3 sm:gap-4 sm:px-6 xl:px-10">
                <Link href="/feed" className="flex shrink-0 items-center gap-3 group">
                    <img
                        src="/images/mission-lokal-logo.png"
                        alt=""
                        className="h-10 w-10 object-contain transition-all duration-200 group-hover:scale-105"
                        style={{ filter: theme.logoFilter }}
                    />
                    <span className={`hidden font-black tracking-tight text-base md:inline ${theme.textMain}`}>MISSION-LOKAL</span>
                </Link>

                <form onSubmit={submitSearch} role="search" className="relative hidden max-w-md flex-1 md:block">
                    <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`} />
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className={`h-11 rounded-2xl pl-11 pr-12 text-xs font-bold ${theme.inputBg} ${theme.cardBorder} ${theme.textMain} shadow-2xs`}
                        placeholder="Search community concerns…"
                        aria-label="Search community concerns"
                    />
                    <button
                        type="submit"
                        className={`absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-white ${theme.primaryBg} ${theme.primaryHover}`}
                        aria-label="Search"
                        title="Search"
                    >
                        <Search className="h-4 w-4" />
                    </button>
                </form>

                <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3">
                    <ThemePickerModal />

                    <button
                        type="button"
                        onClick={() => setMobileSearchOpen((open) => !open)}
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl md:hidden sm:h-11 sm:w-11 ${theme.textMuted} ${theme.hoverBg}`}
                        aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
                        aria-expanded={mobileSearchOpen}
                    >
                        {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                    </button>

                    <Link
                        href="/calendar"
                        className={`hidden h-10 w-10 items-center justify-center rounded-2xl lg:flex xl:h-11 xl:w-11 ${theme.textMuted} ${theme.hoverBg} hover:opacity-100 transition-colors`}
                        aria-label="Calendar"
                    >
                        <CalendarDays className="h-5 w-5" />
                    </Link>

                    <Link 
                        href="/blotters" 
                        className={`hidden lg:flex items-center gap-2 text-xs font-black ${theme.textMuted} ${theme.hoverBg} hover:opacity-100 transition-colors px-3 py-2 rounded-2xl`}
                        aria-label="My Records"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        <span className="hidden xl:inline">My Records</span>
                    </Link>

                    <Link 
                        href="/help" 
                        className={`hidden lg:flex items-center gap-2 text-xs font-black ${theme.textMuted} ${theme.hoverBg} transition-colors px-3 py-2 rounded-2xl`}
                        aria-label="Help"
                    >
                        <CircleHelp className="h-4 w-4" />
                        <span className="hidden xl:inline">Help</span>
                    </Link>

                    <button
                        type="button"
                        onClick={onNotificationsClick ?? (() => undefined)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-colors sm:h-11 sm:w-11 ${theme.textMuted} ${theme.hoverBg} hover:opacity-100`}
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
                            className={`flex items-center gap-2 rounded-2xl border py-1.5 pl-1.5 pr-1.5 transition-colors sm:gap-2.5 sm:pl-2 sm:pr-4 ${theme.cardBorder} ${theme.hoverBg}`}
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
                    <ResidentLogoutButton variant="icon" className="h-10 w-10 sm:h-11 sm:w-11" />
                </div>
            </div>
            {mobileSearchOpen && (
                <form onSubmit={submitSearch} role="search" className={`border-t px-4 py-3 md:hidden ${theme.dividerColor}`}>
                    <div className="relative">
                        <Search className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${theme.textMuted}`} />
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className={`h-11 rounded-xl pl-10 pr-12 text-xs font-bold ${theme.inputBg} ${theme.cardBorder} ${theme.textMain}`}
                            placeholder="Search community concerns…"
                            aria-label="Search community concerns"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className={`absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white ${theme.primaryBg} ${theme.primaryHover}`}
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            )}
        </header>
    );
}