import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, CircleHelp, FileText, Home, Megaphone, MoreHorizontal, ScrollText, ShieldCheck, User, X } from 'lucide-react';
import { useActivePath } from '@/Hooks/useActivePath';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const items = [
    { href: '/feed', label: 'Feed', icon: Home },
    { href: '/announcements', label: 'News', icon: Megaphone },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/blotter/new', label: 'File', ariaLabel: 'File a blotter case', icon: FileText },
];

const moreItems = [
    { href: '/blotters', label: 'My Blotter Records', icon: ShieldCheck },
    { href: '/library', label: 'Resource Library', icon: BookOpen },
    { href: '/documents', label: 'Barangay Documents', icon: ScrollText },
    { href: '/help', label: 'Help', icon: CircleHelp },
    { href: '/profile', label: 'Resident Profile', icon: User },
];

export default function MobileBottomNav() {
    const theme = useResidentTheme();
    const { isActive } = useActivePath();
    const [moreOpen, setMoreOpen] = useState(false);
    const moreActive = moreItems.some(({ href }) => isActive(href));

    useEffect(() => {
        if (!moreOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMoreOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [moreOpen]);

    return (
        <>
            {moreOpen && (
                <>
                    <button
                        type="button"
                        className="fixed inset-0 z-40 bg-slate-950/30"
                        aria-label="Close More menu"
                        onClick={() => setMoreOpen(false)}
                    />
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="resident-mobile-more-title"
                        className={`fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[51] mx-auto max-h-[min(65vh,28rem)] max-w-xl overflow-y-auto rounded-3xl border p-4 shadow-2xl ${theme.cardBorder} ${theme.cardBg}`}
                    >
                        <div className={`mb-2 flex items-center justify-between border-b pb-3 ${theme.dividerColor}`}>
                            <h2 id="resident-mobile-more-title" className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>More</h2>
                            <button
                                type="button"
                                onClick={() => setMoreOpen(false)}
                                aria-label="Close More menu"
                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            {moreItems.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMoreOpen(false)}
                                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold ${theme.textMain} ${theme.hoverBg}`}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${isActive(href) ? theme.primaryText : theme.textMuted}`} />
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </>
            )}

            <nav aria-label="Resident navigation" className={`fixed bottom-0 left-0 right-0 z-50 border-t ${theme.cardBorder} ${theme.cardBg}/95 backdrop-blur-md xl:hidden shadow-xl`}>
            <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:max-w-xl sm:px-4">
                {items.map(({ href, label, ariaLabel, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-label={ariaLabel ?? label}
                            className={cn(
                                'flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-1 text-[10px] font-black uppercase tracking-wider transition-colors sm:text-[11px]',
                                active
                                    ? `${theme.primaryText} ${theme.badgeBg} font-black scale-105`
                                    : `${theme.textMuted} hover:opacity-100`,
                            )}
                        >
                            <Icon className={cn('h-5 w-5 shrink-0', active ? theme.primaryText : 'opacity-60')} />
                            <span className="truncate">{label}</span>
                        </Link>
                    );
                })}
                <button
                    type="button"
                    onClick={() => setMoreOpen((open) => !open)}
                    aria-label="More navigation"
                    aria-expanded={moreOpen}
                    className={cn(
                        'flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-1 text-[10px] font-black uppercase tracking-wider transition-colors sm:text-[11px]',
                        moreActive || moreOpen ? `${theme.primaryText} ${theme.badgeBg}` : `${theme.textMuted} hover:opacity-100`,
                    )}
                >
                    {moreOpen ? <X className="h-5 w-5 shrink-0" /> : <MoreHorizontal className="h-5 w-5 shrink-0" />}
                    <span>More</span>
                </button>
            </div>
            </nav>
        </>
    );
}