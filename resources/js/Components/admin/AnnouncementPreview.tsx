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
    eventAt?: string | null;
};

function formatEventAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

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
    eventAt,
}: Props) {
    const Icon = kindIcons[kind] ?? Megaphone;
    const kindLabel = announcementKindOptions.find((option) => option.value === kind)?.label ?? 'Advisory';

    return (
        <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl sticky top-20 overflow-hidden">
            <CardHeader className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Live Resident Preview</p>
                    <Badge variant="outline" className={isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3 py-1' : 'bg-slate-100 text-slate-600 font-bold px-3 py-1'}>
                        {isPublished ? '● Public State' : '○ Draft State'}
                    </Badge>
                </div>
                <div className="flex items-start gap-4 pt-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">{kindLabel}</p>
                        <CardTitle className="text-base font-extrabold text-slate-900 leading-snug mt-0.5">
                            {title.trim() || 'Untitled Broadcast Advisory'}
                        </CardTitle>
                        {eventAt && (
                            <p className="mt-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl inline-block border border-emerald-200 shadow-2xs">
                                Schedule: {formatEventAt(eventAt)}
                            </p>
                        )}
                        {isPublished && publishedAt && (
                            <p className="mt-1.5 text-xs text-slate-400 font-semibold">Broadcasted {publishedAt}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6 sm:p-8">
                {imageUrl && (
                    <BufferedImage
                        src={imageUrl}
                        alt=""
                        className="aspect-video max-h-56 w-full rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                )}
                <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-100 font-medium">
                    {body.trim() || 'Enter announcement details in the builder to preview how residents will experience this notification on their devices.'}
                </p>
                {kind === 'volunteer' && (
                    <Button type="button" disabled className="w-full bg-blue-600 text-white font-bold shadow-sm rounded-2xl h-11 text-xs">
                        <HandHelping className="mr-2 h-4 w-4" />
                        I Can Help / Volunteer
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}