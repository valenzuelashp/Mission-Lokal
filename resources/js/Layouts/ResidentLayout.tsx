import { Link, router } from '@inertiajs/react';
import { Bell, Menu } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import MobileBottomNav from '@/Components/shared/MobileBottomNav';
import { Button } from '@/Components/ui/button';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { cn } from '@/Lib/utils';

const nav = [
    { href: '/feed', label: 'Feed' },
    { href: '/announcements', label: 'Announcements' },
    { href: '/blotter/new', label: 'Blotter' },
    { href: '/library', label: 'Library' },
    { href: '/profile', label: 'Profile' },
];

export default function ResidentLayout({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const { isActive } = useActivePath();

    return (
        <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
            <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setOpen((v) => !v)}
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Mission-Lokal
                            </p>
                            <p className="text-sm font-semibold text-primary">Demo Barangay</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                            <Link href="/announcements" aria-label="Announcements">
                                <Bell className="h-5 w-5" />
                            </Link>
                        </Button>
                        {user && (
                            <div className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:block">
                                {user.civic_xp} XP
                            </div>
                        )}
                    </div>
                </div>
                <nav className="hidden border-t md:block">
                    <div className="mx-auto flex max-w-5xl items-center gap-1 px-4">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                                    isActive(item.href)
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="ml-auto px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
                <nav className={cn('border-t px-4 py-3 md:hidden', open ? 'block' : 'hidden')}>
                    <div className="flex flex-col gap-1 text-sm">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-md px-2 py-2 hover:bg-muted"
                                onClick={() => setOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="rounded-md px-2 py-2 text-left hover:bg-muted"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
            <MobileBottomNav />
        </div>
    );
}
