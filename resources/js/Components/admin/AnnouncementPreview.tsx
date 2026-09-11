import { Bell, CalendarDays, HandHelping, Megaphone, LucideIcon } from 'lucide-react';
import BufferedImage from '@/Components/shared/BufferedImage';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { announcementKindOptions, type AnnouncementKind } from '@/Types';

type Props = {
    title: string;
    body: string;
    kind?: AnnouncementKind;
    imageUrl?: string | null;
    isPublished: boolean;
    publishedAt?: string | null;
};

const kindIcons: Record<AnnouncementKind, LucideIcon> = {
    advisory: Bell,
    event: CalendarDays,
    volunteer: HandHelping,
};

export default function AnnouncementPreview({
    title,
    body,
    kind = 'advisory',
    imageUrl,
    isPublished,
    publishedAt,
}: Props) {
    const Icon = kindIcons[kind] ?? Megaphone;
    const kindLabel = announcementKindOptions.find((option) => option.value === kind)?.label ?? 'Advisory';

    return (
        <Card className="border-dashed">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resident preview</p>
                    <Badge variant="outline" className="text-[10px]">
                        {isPublished ? 'Will be public' : 'Draft only'}
                    </Badge>
                </div>
                <div className="flex items-start gap-3 pt-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{kindLabel}</p>
                        <CardTitle className="text-base leading-snug">
                            {title.trim() || 'Announcement title'}
                        </CardTitle>
                        {isPublished && publishedAt && (
                            <p className="mt-1 text-xs text-muted-foreground">Posted {publishedAt}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {imageUrl && (
                    <BufferedImage
                        src={imageUrl}
                        alt=""
                        className="aspect-video max-h-52 w-full rounded-lg"
                    />
                )}
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {body.trim() || 'Write the announcement body here. Residents will see this on the announcements feed.'}
                </p>
                {kind === 'volunteer' && (
                    <Button type="button" disabled className="bg-teal-700 text-white">
                        <HandHelping className="h-4 w-4" />
                        I can help
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}