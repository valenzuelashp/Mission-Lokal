import { Megaphone } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

type Props = {
    title: string;
    body: string;
    imageUrl?: string | null;
    isPublished: boolean;
    publishedAt?: string | null;
};

export default function AnnouncementPreview({ title, body, imageUrl, isPublished, publishedAt }: Props) {
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
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
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
                    <img
                        src={imageUrl}
                        alt=""
                        className="w-full rounded-lg object-cover"
                        style={{ maxHeight: '200px' }}
                    />
                )}
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {body.trim() || 'Write the announcement body here. Residents will see this on the announcements feed.'}
                </p>
            </CardContent>
        </Card>
    );
}
