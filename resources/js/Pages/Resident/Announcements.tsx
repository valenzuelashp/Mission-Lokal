import { Head, Link } from '@inertiajs/react';
import { Megaphone, Shield, ArrowRight } from 'lucide-react';
import AnnouncementCard from '@/Components/resident/AnnouncementCard';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import EmptyState from '@/Components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { publishedAnnouncements } from '@/Lib/residentDemo';
import type { AnnouncementsPageProps } from '@/Types';

export default function Announcements(props: Partial<AnnouncementsPageProps>) {
    const announcements = props.announcements ?? publishedAnnouncements;

    const rightAside = (
        <div className="space-y-4">
            {/* Minimalist Editorial Barangay Information Panel */}
            <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-1">
                <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-900">
                        <div className="p-1 bg-neutral-100 rounded-md text-neutral-800">
                            <Shield className="h-3.5 w-3.5" />
                        </div>
                        Barangay Central
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 text-xs font-medium text-neutral-500 leading-relaxed">
                    <p>Official advisories, emergency alerts, and community updates from your barangay hall.</p>
                    <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-400">
                        <span>Published posts</span>
                        <span className="text-neutral-900 font-black px-2 py-0.5 bg-neutral-100 rounded-md">
                            {announcements.length}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Clean Secondary Navigation Hub Panel */}
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-200 hover:border-neutral-300">
                <CardContent className="p-4">
                    <Link href="/feed" className="group flex items-center justify-between text-xs font-black uppercase tracking-widest text-neutral-900">
                        <span>Community Feed</span>
                        <div className="flex items-center gap-1 text-neutral-400 group-hover:text-neutral-900 transition-colors">
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Official Bulletin" />

            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 space-y-4 w-full px-2 sm:px-4 md:px-6">
                {/* High-End Clean Page Title Masthead Header */}
                <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                    <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm border border-neutral-800">
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-black tracking-wider text-neutral-950 uppercase">
                                Barangay Announcements
                            </h1>
                            <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                                Advisories and updates from Central officials.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Stream Layout */}
                <ResidentSocialShell right={rightAside}>
                    {announcements.length === 0 ? (
                        <div className="border border-neutral-200/60 bg-white/60 backdrop-blur-md rounded-2xl p-10 text-center shadow-sm">
                            <EmptyState
                                title="No announcements yet"
                                description="Check back later for official barangay advisories and active community updates."
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((item) => (
                                <div key={item.id} className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                                    <AnnouncementCard announcement={item} />
                                </div>
                            ))}
                        </div>
                    )}
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}