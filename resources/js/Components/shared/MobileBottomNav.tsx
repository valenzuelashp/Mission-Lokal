import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Home, User } from 'lucide-react';
import { cn } from '@/Lib/utils';
import { useActivePath } from '@/Hooks/useActivePath';

const items = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/blotter/new', label: 'Blotter', icon: FileText },
    { href: '/library', label: 'Library', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileBottomNav() {
    const { isActive } = useActivePath();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
                {items.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
                            isActive(href)
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
