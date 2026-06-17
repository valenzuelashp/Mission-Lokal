import { Link, router } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const nav = [
    { href: '/feed', label: 'Feed' },
    { href: '/blotter/new', label: 'Blotter' },
    { href: '/library', label: 'Library' },
    { href: '/announcements', label: 'Announcements' },
    { href: '/profile', label: 'Profile' },
];

export default function ResidentLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                    <span className="font-semibold text-primary">Mission-Lokal</span>
                    <nav className="flex items-center gap-4 text-sm">
                        {nav.map((item) => (
                            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
                                {item.label}
                            </Link>
                        ))}
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </div>
    );
}
