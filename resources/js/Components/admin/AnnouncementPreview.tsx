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
        <Card className="border-dashed border-neutral-300 bg-neutral-50/40 rounded-2xl overflow-hidden shadow-xs">
            <CardHeader className="pb-3.5 px-5 pt-4 border-b border-neutral-200/40 bg-neutral-50/20">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Resident view sandbox</p>
                    <Badge variant="outline" className="rounded-md border-neutral-200 bg-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 text-neutral-500">
                        {isPublished ? 'Public broadcast' : 'Staged Draft'}
                    </Badge>
                </div>
                <div className="flex items-start gap-3.5 pt-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-xs">
                        <Megaphone className="h-4.5 w-4.5 stroke-[2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-black tracking-tight text-neutral-900 leading-snug">
                            {title.trim() || 'Untitled Advisory Entry'}
                        </CardTitle>
                        {isPublished && publishedAt && (
                            <p className="mt-1 text-[10px] font-medium text-neutral-400 tracking-wide uppercase">Published {publishedAt}</p>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
                {imageUrl && (
                    <div className="relative overflow-hidden rounded-xl border border-neutral-200/80 shadow-xs max-h-[220px]">
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full object-cover"
                            style={{ maxHeight: '220px' }}
                        />
                    </div>
                )}
                <p className="whitespace-pre-wrap text-xs font-medium text-neutral-600 leading-relaxed bg-white/60 border border-neutral-200/40 rounded-xl p-3.5 shadow-2xs">
                    {body.trim() || 'Write the detailed advisory disclosure text inside the controller panel config block. The markdown array formatting rules structure will render here in real-time context.'}
                </p>
            </CardContent>
        </Card>
    );
}