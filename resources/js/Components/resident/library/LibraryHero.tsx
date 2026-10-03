import { BookOpen, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

export default function LibraryHero() {
    const theme = useResidentTheme();

    return (
        <Card className={`${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl`}>
            <CardContent className="flex items-center gap-4 p-5 sm:p-6">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white shadow-md`}>
                    <BookOpen className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-base font-extrabold flex items-center gap-2">
                        <span>Municipal Resource & Safety Library</span>
                        <ShieldCheck className={`h-4 w-4 ${theme.primaryText}`} />
                    </h2>
                    <p className={`text-xs ${theme.textMuted} leading-relaxed font-medium`}>
                        Access official emergency protocols, evacuation manuals, and verified municipal hotlines. Fully available offline via PWA caching.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}