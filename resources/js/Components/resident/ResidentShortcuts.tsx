import { Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, FileText, Home, Megaphone, User } from 'lucide-react';
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
    { href: '/profile', label: 'Resident Profile', icon: User },
];

export default function ResidentShortcuts() {
    const theme = useResidentTheme();
    const { user } = useAuth();
    const { isActive } = useActivePath();
    const initials = user?.first_name?.[0] ?? user?.account_id?.slice(0, 2) ?? 'R';
    const fullName = user ? `${user.first_name} ${user.last_name}` : 'Resident Account';

    return (
        <div className="space-y-4">
            <Link href="/profile" className="block group">
                <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs transition-all hover:shadow-sm rounded-2xl`}>
                    <CardContent className="flex items-center gap-3.5 p-4">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-xs font-black text-white shadow-2xs group-hover:scale-105 transition-transform`}>
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold transition-colors">{fullName}</p>
                            <p className={`text-xs font-extrabold ${theme.primaryText} mt-0.5`}>{user?.civic_xp ?? 0} Civic XP Earned</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Card className={`border ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl`}>
                <CardContent className="p-2 space-y-1">
                    <p className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                        Quick Navigation
                    </p>
                    {shortcuts.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all',
                                    active 
                                        ? `${theme.primaryBg} text-white shadow-sm font-black translate-x-1` 
                                        : `${theme.textMuted} hover:bg-slate-100/50 hover:opacity-100`,
                                )}
                            >
                                <item.icon className={cn('h-4 w-4 shrink-0', active ? 'text-white' : 'opacity-60')} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className={`mt-2 border-t ${theme.dividerColor} pt-1`}>
                        <ResidentLogoutButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}