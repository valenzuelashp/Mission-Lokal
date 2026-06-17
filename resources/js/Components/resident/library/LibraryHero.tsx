import { Card, CardContent } from '@/Components/ui/card';

export default function LibraryHero() {
    return (
        <Card className="border-primary/15 bg-primary/5 shadow-sm">
            <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground">
                    Emergency guides and verified barangay contacts for your household.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Manuals work offline when Mission-Lokal is installed as a PWA.
                </p>
            </CardContent>
        </Card>
    );
}
