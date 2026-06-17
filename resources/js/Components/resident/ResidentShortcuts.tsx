import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Home, Megaphone, User } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { demoResidentProfile } from '@/Lib/residentDemo';
import { cn } from '@/Lib/utils';

const shortcuts = [
    { href: '/feed', label: 'Public feed', icon: Home },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/blotter/new', label: 'File blotter', icon: FileText },
    { href: '/library', label: 'Resiliency library', icon: BookOpen },
    { href: '/profile', label: 'My profile', icon: User },
];

export default function ResidentShortcuts() {
    const { user } = useAuth();
    const { isActive } = useActivePath();
    const initials = user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <div className="space-y-3">
            <Link href="/profile">
                <Card className="shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {initials}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-semibold">{demoResidentProfile.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user?.civic_xp ?? 0} civic XP</p>
                        </div>
                    </CardContent>
                </Card>
            </Link>

            <Card className="shadow-sm">
                <CardContent className="p-2">
                    <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Shortcuts
                    </p>
                    {shortcuts.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-[#f0f2f5]',
                                isActive(item.href) && 'bg-primary/10 text-primary',
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0 text-primary" />
                            {item.label}
                        </Link>
                    ))}
                    <div className="mt-1 border-t pt-1">
                        <ResidentLogoutButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
