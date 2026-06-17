import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Home, Megaphone, User } from 'lucide-react';
import { cn } from '@/Lib/utils';
import { useActivePath } from '@/Hooks/useActivePath';

const items = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/announcements', label: 'News', icon: Megaphone },
    { href: '/blotter/new', label: 'Blotter', icon: FileText },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileBottomNav() {
    const { isActive } = useActivePath();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-lg items-center justify-around px-1 py-1.5">
                {items.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium transition-colors',
                            isActive(href)
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
