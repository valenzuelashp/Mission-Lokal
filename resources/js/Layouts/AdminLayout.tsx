import { Link, router } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const nav = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/map', label: 'Map' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/missions', label: 'Missions' },
    { href: '/admin/verifications', label: 'Verifications' },
    { href: '/admin/residents', label: 'Residents' },
    { href: '/admin/blotters', label: 'Blotters' },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            <aside className="w-56 border-r bg-muted/30 p-4">
                <p className="mb-6 font-semibold text-primary">Admin</p>
                <nav className="flex flex-col gap-2 text-sm">
                    {nav.map((item) => (
                        <Link key={item.href} href={item.href} className="rounded px-2 py-1 hover:bg-muted">
                            {item.label}
                        </Link>
                    ))}
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="mt-4 rounded px-2 py-1 text-left text-sm hover:bg-muted"
                    >
                        Logout
                    </button>
                </nav>
            </aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
