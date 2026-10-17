import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type MissionResolution = {
    id: string;
    title: string;
    body: string;
    photos: string[];
    published_at: string | null;
};

export default function MissionResolutionCard({ update }: { update: MissionResolution }) {
    const theme = useResidentTheme();

    return (
        <Card className={`overflow-hidden rounded-3xl border ${theme.badgeBorder} ${theme.badgeBg} shadow-sm w-full`}>
            <CardContent className="space-y-4 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                    <div className={`flex items-center gap-2 ${theme.primaryText}`}>
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="text-xs font-black uppercase tracking-wider">Verified Community Resolution</span>
                    </div>
                    {update.published_at && <time className={`shrink-0 text-xs font-bold ${theme.textMuted}`}>{update.published_at}</time>}
                </div>
                <h3 className={`text-lg font-black tracking-tight ${theme.textMain}`}>{update.title}</h3>
                <p className={`whitespace-pre-line text-sm leading-relaxed ${theme.textMuted} font-medium`}>{update.body}</p>
                {update.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-2">
                        {update.photos.map((photo, index) => (
                            <img
                                key={`${update.id}-${index}`}
                                src={photo}
                                alt={`Verified completion evidence ${index + 1}`}
                                className={`aspect-[4/3] w-full rounded-2xl border ${theme.cardBorder} object-cover shadow-2xs`}
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}