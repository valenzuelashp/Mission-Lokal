import { Card, CardContent } from '@/Components/ui/card';
import { BookOpen } from 'lucide-react';

export default function LibraryHero() {
    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/10 shadow-xs">
            <CardContent className="flex items-start gap-3.5 p-4 sm:p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-2xs">
                    <BookOpen className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                        Emergency guides and verified barangay contacts for your household.
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Manuals remain fully accessible offline when Mission-Lokal is installed as a PWA on your device.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}