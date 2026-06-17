import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function PersonnelLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
                    <span className="font-semibold">Personnel</span>
                    <nav className="flex gap-4 text-sm">
                        <Link href="/personnel/missions">Missions</Link>
                        <Link href="/personnel/notifications">Notifications</Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </div>
    );
}
