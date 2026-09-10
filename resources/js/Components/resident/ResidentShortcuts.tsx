import { Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, FileText, Home, Megaphone, User } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { cn } from '@/Lib/utils';

const shortcuts = [
    { href: '/feed', label: 'Public feed', icon: Home },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/blotter/new', label: 'File blotter', icon: FileText },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/profile', label: 'My profile', icon: User },
];

export default function ResidentShortcuts() {
    const { user } = useAuth();
    const { isActive } = useActivePath();
    const initials = user?.first_name?.[0] ?? user?.account_id?.slice(0, 2) ?? 'R';
    const fullName = user ? `${user.first_name} ${user.last_name}` : 'Resident Account';

    return (
        <div className="space-y-3">
            <Link href="/profile" className="block">
                <Card className="border-slate-200/80 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
                    <CardContent className="flex items-center gap-3 p-3.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-xs">
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{fullName}</p>
                            <p className="text-xs font-medium text-primary">{user?.civic_xp ?? 0} civic XP</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Card className="border-slate-200/80 shadow-xs">
                <CardContent className="p-2 space-y-0.5">
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Shortcuts
                    </p>
                    {shortcuts.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                isActive(item.href) && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-semibold',
                            )}
                        >
                            <item.icon className={cn('h-4 w-4 shrink-0', isActive(item.href) ? 'text-primary' : 'text-slate-500')} />
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-1 border-t border-slate-100 pt-1">
                        <ResidentLogoutButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}