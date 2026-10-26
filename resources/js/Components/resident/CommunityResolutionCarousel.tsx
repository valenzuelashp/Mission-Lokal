import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type ResolutionPreview = {
    id: string;
    title: string;
    body: string;
    photos: string[];
    published_at: string | null;
};

export default function CommunityResolutionCarousel({
    items,
    compact = false,
}: {
    items: ResolutionPreview[];
    compact?: boolean;
}) {
    const theme = useResidentTheme();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (items.length < 2) return;

        const interval = window.setInterval(() => {
            setActiveIndex((index) => (index + 1) % items.length);
        }, 5000);
        return () => window.clearInterval(interval);
    }, [items.length]);

    if (items.length === 0) return null;

    const activeItem = items[activeIndex];
    const previous = () => setActiveIndex((index) => (index - 1 + items.length) % items.length);
    const next = () => setActiveIndex((index) => (index + 1) % items.length);

    return (
        <Card className={`rounded-3xl overflow-hidden ${compact ? `border-2 ${theme.badgeBorder} ${theme.accentSurface} shadow-md` : `border ${theme.cardBorder} ${theme.cardBg} shadow-2xs`}`}>
            <CardHeader className={`flex flex-row items-center justify-between gap-3 pb-4 border-b ${theme.dividerColor}`}>
                <CardTitle className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${theme.textMain}`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${theme.primaryText}`} />
                    {compact ? 'Latest Verified Resolution' : 'Community Resolutions'}
                </CardTitle>
                <Link href="/resolutions" className={`shrink-0 text-xs font-bold ${theme.primaryText} hover:underline`}>
                    See all →
                </Link>
            </CardHeader>
            <CardContent className={`space-y-3 ${compact ? 'p-4 sm:p-5' : 'pt-4'}`}>
                <Link href="/resolutions" className={`block space-y-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 ${theme.focusRing}`}>
                    {!compact && activeItem.photos[0] && (
                        <img
                            src={activeItem.photos[0]}
                            alt=""
                            className="aspect-[16/8] w-full rounded-xl object-cover"
                            loading="lazy"
                        />
                    )}
                    {activeItem.published_at && (
                        <time className={`block text-[11px] font-semibold ${theme.textMuted}`}>
                            {activeItem.published_at}
                        </time>
                    )}
                    <h3 className={`line-clamp-2 text-sm font-black ${theme.textMain}`}>{activeItem.title}</h3>
                    <p className={`line-clamp-3 whitespace-pre-line text-xs leading-relaxed ${theme.textMuted}`}>
                        {activeItem.body}
                    </p>
                    {!compact && (
                        <span className={`inline-block text-xs font-bold ${theme.primaryText}`}>Open resolution archive →</span>
                    )}
                </Link>

                <div className={`flex items-center justify-between border-t ${theme.dividerColor} pt-3`}>
                    <span className={`text-[11px] font-semibold ${theme.textMuted}`} aria-live="polite">
                        {items.length > 1 ? `${activeIndex + 1} of ${items.length}` : 'Latest update'}
                    </span>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="icon" aria-label="Previous resolution" onClick={previous} disabled={items.length < 2} className="h-8 w-8 rounded-lg">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" aria-label="Next resolution" onClick={next} disabled={items.length < 2} className="h-8 w-8 rounded-lg">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
