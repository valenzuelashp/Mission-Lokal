import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { BookOpen, FolderOpen } from 'lucide-react';
import LibraryHero from '@/Components/resident/library/LibraryHero';
import PreparednessManuals from '@/Components/resident/library/PreparednessManuals';
import RespondersDirectory from '@/Components/resident/library/RespondersDirectory';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { LibraryPageProps } from '@/Types';

export default function Library({ manuals = [], contacts = [] }: LibraryPageProps) {
    const theme = useResidentTheme();

    useEffect(() => {
        try {
            window.localStorage.setItem(
                'mission-lokal-library-v1',
                JSON.stringify({ manuals, contacts, savedAt: new Date().toISOString() }),
            );
        } catch {}
    }, [manuals, contacts]);

    const rightAside = (
        <>
            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardContent className="p-5 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider">Offline PWA Caching</h3>
                    <p className={`text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                        This resource library is cached locally on your device when online. It remains accessible during power or network outages.
                    </p>
                </CardContent>
            </Card>

            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardContent className="p-5 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider">Need Immediate Assistance?</h3>
                    <p className={`text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                        For urgent disputes or hazards, file a formal blotter or submit a public concern report.
                    </p>
                    <Link href="/blotter/new" className={`inline-block pt-1 text-xs font-bold ${theme.primaryText} hover:underline`}>
                        File a formal blotter case →
                    </Link>
                </CardContent>
            </Card>
        </>
    );

    const hasData = manuals.length > 0 || contacts.length > 0;

    return (
        <ResidentLayout wide>
            <Head title="Resource Library" />

            <ResidentSocialShell right={rightAside}>
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white shadow-md`}>
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black tracking-tight">Resource & Safety Library</h1>
                            <p className={`text-xs font-medium ${theme.textMuted} mt-0.5`}>
                                Verified emergency manuals and municipal hotline directories
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {hasData ? (
                    <div className="space-y-5">
                        <LibraryHero />
                        {manuals.length > 0 && <PreparednessManuals manuals={manuals} />}
                        {contacts.length > 0 && <RespondersDirectory contacts={contacts} />}
                    </div>
                ) : (
                    <div className={`rounded-2xl border border-dashed ${theme.cardBorder} ${theme.cardBg} p-16 text-center shadow-xs`}>
                        <FolderOpen className="mx-auto mb-3 h-10 w-10 opacity-40" />
                        <h3 className="text-base font-black">Library repository is currently empty</h3>
                        <p className={`mt-1 text-xs font-medium ${theme.textMuted} max-w-xs mx-auto`}>
                            Barangay administrators have not yet populated emergency guidelines or hotline directories.
                        </p>
                    </div>
                )}
            </ResidentSocialShell>
        </ResidentLayout>
    );
}