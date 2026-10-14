import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';

type MissionResolution = {
    id: string;
    title: string;
    body: string;
    photos: string[];
    published_at: string | null;
};

export default function MissionResolutionCard({ update }: { update: MissionResolution }) {
    return (
        <Card className="overflow-hidden rounded-xl border-emerald-200 bg-white shadow-xs">
            <CardContent className="space-y-3 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Verified Community Resolution</span>
                    </div>
                    {update.published_at && <time className="shrink-0 text-[10px] font-semibold text-slate-500">{update.published_at}</time>}
                </div>
                <h3 className="text-base font-black text-slate-900">{update.title}</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{update.body}</p>
                {update.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {update.photos.map((photo, index) => (
                            <img
                                key={`${update.id}-${index}`}
                                src={photo}
                                alt={`Verified completion evidence ${index + 1}`}
                                className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover"
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}