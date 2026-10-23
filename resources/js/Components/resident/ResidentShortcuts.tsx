import { Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, FileText, Home, Megaphone, ScrollText, User } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const shortcuts = [
    { href: '/feed', label: 'Public Feed', icon: Home },
    { href: '/announcements', label: 'News & Broadcasts', icon: Megaphone },
    { href: '/calendar', label: 'Civic Calendar', icon: CalendarDays },
    { href: '/blotter/new', label: 'File Blotter Case', icon: FileText },
    { href: '/library', label: 'Resource Library', icon: BookOpen },
    { href: '/documents', label: 'Barangay Documents', icon: ScrollText },
    { href: '/profile', label: 'Resident Profile', icon: User },
];

export default function ResidentShortcuts() {
    const theme = useResidentTheme();
    const { user } = useAuth();
    const { isActive } = useActivePath();
    const initials = user?.first_name?.[0] ?? user?.account_id?.slice(0, 2) ?? 'R';
    const fullName = user ? `${user.first_name} ${user.last_name}` : 'Resident Account';

    return (
        <div className="space-y-5 w-full">
            <Link href="/profile" className="block group">
                <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-sm transition-all hover:shadow-md rounded-3xl overflow-hidden`}>
                    <CardContent className="flex items-center gap-4 p-5">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-xs font-black text-white shadow-2xl group-hover:scale-105 transition-transform`}>
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <p className={`truncate text-sm font-black ${theme.textMain} transition-colors`}>{fullName}</p>
                            <p className={`text-xs font-black ${theme.primaryText} mt-0.5`}>{user?.civic_xp ?? 0} Civic XP Earned</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-sm rounded-3xl overflow-hidden`}>
                <CardContent className="p-3 space-y-1.5">
                    <p className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                        Quick Navigation
                    </p>
                    {shortcuts.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3.5 rounded-2xl px-4 py-3 text-xs font-black transition-all',
                                    active 
                                        ? `${theme.primaryBg} text-white shadow-md translate-x-1` 
                                        : `${theme.textMuted} hover:${theme.badgeBg} hover:opacity-100`,
                                )}
                            >
                                <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'opacity-60')} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className={`mt-3 border-t ${theme.dividerColor} pt-2`}>
                        <ResidentLogoutButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}