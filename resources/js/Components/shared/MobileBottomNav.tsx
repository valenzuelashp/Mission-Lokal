import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Home, Megaphone, User } from 'lucide-react';
import { useActivePath } from '@/Hooks/useActivePath';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const items = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/announcements', label: 'News', icon: Megaphone },
    { href: '/blotters', label: 'Blotters', icon: FileText },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileBottomNav() {
    const theme = useResidentTheme();
    const { isActive } = useActivePath();

    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t ${theme.cardBorder} ${theme.cardBg}/95 backdrop-blur-md lg:hidden shadow-lg`}>
            <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
                {items.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors',
                                active
                                    ? `${theme.primaryText} ${theme.badgeBg} font-black`
                                    : `${theme.textMuted} hover:opacity-100`,
                            )}
                        >
                            <Icon className={cn('h-5 w-5 shrink-0', active ? theme.primaryText : 'opacity-60')} />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}