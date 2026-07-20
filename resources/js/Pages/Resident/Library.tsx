import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, Smartphone } from 'lucide-react';
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
        <div className="space-y-4">
            {/* Offline Utility Card */}
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4">
                <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950 flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-neutral-500" /> Offline access
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-xs font-medium text-neutral-500 leading-relaxed">
                    <p>Install Mission-Lokal as a PWA to access emergency guides and contacts even without an active internet connection.</p>
                </CardContent>
            </Card>

            {/* Support Actions Quick Access Card */}
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4 space-y-2">
                <CardHeader className="p-0 pb-1">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Need help now?</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-xs font-medium text-neutral-500 space-y-2.5">
                    <p>For urgent incidents, file a official blotter report or submit an emergency concern directly to the live feed.</p>
                    <Link href="/blotter/new" className="font-bold text-neutral-900 block hover:underline text-[11px] uppercase tracking-wider">
                        File a blotter →
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Resiliency Library" />

            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 space-y-4 w-full px-2 sm:px-4 md:px-6">
                {/* Header Information Panel */}
                <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                    <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm border border-neutral-800">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-black tracking-wider text-neutral-950 uppercase">
                                Resiliency Library
                            </h1>
                            <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                                Manuals and emergency contact registries for your residential block.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Components Stack */}
                <ResidentSocialShell right={rightAside}>
                    <div className="space-y-4">
                        <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden p-1">
                            <LibraryHero />
                        </div>
                        <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden p-4">
                            <PreparednessManuals manuals={manuals} />
                        </div>
                        <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden p-4">
                            <RespondersDirectory contacts={contacts} />
                        </div>
                    </div>
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}