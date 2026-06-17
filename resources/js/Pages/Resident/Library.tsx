import { Head, Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import LibraryHero from '@/Components/resident/library/LibraryHero';
import PreparednessManuals from '@/Components/resident/library/PreparednessManuals';
import RespondersDirectory from '@/Components/resident/library/RespondersDirectory';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { libraryContacts, libraryManuals } from '@/Lib/residentDemo';
import type { LibraryPageProps } from '@/Types';

export default function Library(props: Partial<LibraryPageProps>) {
    const manuals = props.manuals ?? libraryManuals;
    const contacts = props.contacts ?? libraryContacts;

    const rightAside = (
        <>
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Offline access</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>
                        Install Mission-Lokal as a PWA to access emergency guides and contacts even without
                        internet.
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Need help now?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                        For urgent incidents, file a blotter or report a concern on the public feed.
                    </p>
                    <Link href="/blotter/new" className="font-medium text-primary hover:underline">
                        File a blotter →
                    </Link>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Resiliency Library" />

            <ResidentSocialShell right={rightAside}>
                <Card className="shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold">Resiliency library</h1>
                            <p className="text-sm text-muted-foreground">
                                Manuals and contacts for emergencies in your barangay
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <LibraryHero />
                <PreparednessManuals manuals={manuals} />
                <RespondersDirectory contacts={contacts} />
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
