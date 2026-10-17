import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, FileText, TrendingUp } from 'lucide-react';
import AnnouncementCard from '@/Components/resident/AnnouncementCard';
import ConcernCard from '@/Components/resident/ConcernCard';
import FeedComposer from '@/Components/resident/FeedComposer';
import MissionResolutionCard from '@/Components/resident/MissionResolutionCard';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

type FeedPageProps = PageProps & {
    concerns: any[];
    resolutionPosts?: any[];
    announcements: any[];
    userStats: {
        total_reports: number;
        active_reports: number;
    };
};

export default function Feed({ concerns, resolutionPosts = [], announcements = [], userStats }: FeedPageProps) {
    const theme = useResidentTheme();
    const { user } = useAuth();
    const { flash } = usePage<PageProps>().props;

    const totalReports = userStats?.total_reports ?? 0;
    const activeReports = userStats?.active_reports ?? 0;

    const rightAside = (
        <div className="space-y-6">
            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Your Civic Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5 text-xs font-bold">
                    <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-2.5 ${theme.textMuted} font-medium`}>
                            <TrendingUp className={`h-4 w-4 ${theme.primaryText}`} />
                            Civic XP Score
                        </span>
                        <span className={`font-black ${theme.primaryText} text-sm`}>{user?.civic_xp ?? 0} XP</span>
                    </div>
                    <div className={`flex items-center justify-between border-t ${theme.dividerColor} pt-3.5`}>
                        <span className={`flex items-center gap-2.5 ${theme.textMuted} font-medium`}>
                            <FileText className="h-4 w-4 opacity-60" />
                            Total Reports Filed
                        </span>
                        <span className={`font-bold ${theme.textMain}`}>{totalReports}</span>
                    </div>
                    <div className={`flex items-center justify-between border-t ${theme.dividerColor} pt-3.5`}>
                        <span className={`flex items-center gap-2.5 ${theme.textMuted} font-medium`}>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Active Reports
                        </span>
                        <span className={`font-bold ${theme.textMain}`}>{activeReports}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`flex flex-row items-center justify-between pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Latest Broadcasts</CardTitle>
                    <Link href="/announcements" className={`text-xs font-bold ${theme.primaryText} hover:underline`}>
                        See all →
                    </Link>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-5">
                    {announcements.length === 0 ? (
                        <p className={`text-xs ${theme.textMuted} font-semibold text-center py-4`}>No active broadcasts.</p>
                    ) : (
                        announcements.slice(0, 2).map((item) => (
                            <AnnouncementCard key={item.id} announcement={item} compact />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Community Feed" />
            
            <div className="w-full space-y-6 pb-16">
                {flash.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                        <AlertCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                        {flash.success}
                    </div>
                )}

                <ResidentSocialShell right={rightAside}>
                    <div className="w-full space-y-6">
                        <FeedComposer />

                        {resolutionPosts.length > 0 && (
                            <section className="space-y-3.5" aria-labelledby="community-resolutions-heading">
                                <h2 id="community-resolutions-heading" className="text-xs font-black uppercase tracking-wider text-emerald-800">Verified Community Resolutions</h2>
                                {resolutionPosts.map((update) => <MissionResolutionCard key={update.id} update={update} />)}
                            </section>
                        )}

                        {concerns.length === 0 && resolutionPosts.length === 0 ? (
                            <div className={`rounded-3xl border border-dashed ${theme.cardBorder} ${theme.cardBg} px-6 py-16 text-center shadow-2xs`}>
                                <h3 className={`font-black text-base ${theme.textMain}`}>No public concerns reported yet</h3>
                                <p className={`mt-1.5 text-xs font-semibold ${theme.textMuted} max-w-sm mx-auto leading-relaxed`}>
                                    Be the first neighbor to report a community issue and help municipal staff triage operations.
                                </p>
                                <div className="mt-6">
                                    <Button asChild className={`${theme.primaryBg} ${theme.primaryHover} text-white font-black text-xs shadow-sm cursor-pointer rounded-2xl h-11 px-6`}>
                                        <Link href="/concerns/new">Post a Community Concern</Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {concerns.map((concern) => <ConcernCard key={concern.id} concern={concern} />)}
                            </div>
                        )}
                    </div>
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}