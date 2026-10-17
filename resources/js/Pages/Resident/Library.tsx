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
        <div className="space-y-6">
            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardContent className="p-6 space-y-3">
                    <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Offline PWA Caching</h3>
                    <p className={`text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                        This resource library is cached locally on your device when online. It remains accessible during power or network outages.
                    </p>
                </CardContent>
            </Card>

            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardContent className="p-6 space-y-3">
                    <h3 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Need Immediate Assistance?</h3>
                    <p className={`text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                        For urgent disputes or hazards, file a formal blotter or submit a public concern report.
                    </p>
                    <Link href="/blotter/new" className={`inline-block pt-1 text-xs font-black ${theme.primaryText} hover:underline`}>
                        File a formal blotter case →
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    const hasData = manuals.length > 0 || contacts.length > 0;

    return (
        <ResidentLayout wide>
            <Head title="Resource Library" />

            <ResidentSocialShell right={rightAside}>
                <div className="w-full space-y-6">
                    <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardContent className="flex items-center gap-5 p-6 sm:p-8">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white shadow-md`}>
                                <BookOpen className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.textMain}`}>Resource & Safety Library</h1>
                                <p className={`text-xs sm:text-sm font-medium ${theme.textMuted} mt-1 leading-relaxed`}>
                                    Verified emergency manuals and municipal hotline directories
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {hasData ? (
                        <div className="space-y-6">
                            <LibraryHero />
                            {manuals.length > 0 && <PreparednessManuals manuals={manuals} />}
                            {contacts.length > 0 && <RespondersDirectory contacts={contacts} />}
                        </div>
                    ) : (
                        <div className={`rounded-3xl border border-dashed ${theme.cardBorder} ${theme.cardBg} p-20 text-center shadow-2xs`}>
                            <FolderOpen className={`mx-auto mb-4 h-12 w-12 ${theme.textMuted} opacity-40`} />
                            <h3 className={`text-base font-black ${theme.textMain}`}>Library repository is currently empty</h3>
                            <p className={`mt-1.5 text-xs font-semibold ${theme.textMuted} max-w-sm mx-auto leading-relaxed`}>
                                Barangay administrators have not yet populated emergency guidelines or hotline directories.
                            </p>
                        </div>
                    )}
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}