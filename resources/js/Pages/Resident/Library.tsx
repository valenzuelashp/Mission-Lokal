import { Head, Link } from '@inertiajs/react';
import { BookOpen, FolderOpen } from 'lucide-react';
import LibraryHero from '@/Components/resident/library/LibraryHero';
import PreparednessManuals from '@/Components/resident/library/PreparednessManuals';
import RespondersDirectory from '@/Components/resident/library/RespondersDirectory';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { LibraryPageProps } from '@/Types';

export default function Library({ manuals = [], contacts = [] }: LibraryPageProps) {
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

    const hasData = manuals.length > 0 || contacts.length > 0;

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

                {hasData ? (
                    <>
                        <LibraryHero />
                        {manuals.length > 0 && <PreparednessManuals manuals={manuals} />}
                        {contacts.length > 0 && <RespondersDirectory contacts={contacts} />}
                    </>
                ) : (
                    <Card className="border-dashed shadow-none">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <FolderOpen className="mb-4 h-12 w-12 stroke-1 text-muted-foreground/60" />
                            <h3 className="font-medium text-foreground">Library is empty</h3>
                            <p className="mt-1 text-sm max-w-xs">
                                Your barangay administrators haven't uploaded emergency reference guidelines or resource direct lines yet.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </ResidentSocialShell>
        </ResidentLayout>
    );
}