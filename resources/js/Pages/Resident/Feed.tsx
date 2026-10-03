import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, FileText, TrendingUp } from 'lucide-react';
import AnnouncementCard from '@/Components/resident/AnnouncementCard';
import ConcernCard from '@/Components/resident/ConcernCard';
import FeedComposer from '@/Components/resident/FeedComposer';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { PageProps } from '@/Types';

type FeedPageProps = PageProps & {
    concerns: any[];
    announcements: any[];
    userStats: {
        total_reports: number;
        active_reports: number;
    };
};

export default function Feed({ concerns, announcements = [], userStats }: FeedPageProps) {
    const theme = useResidentTheme();
    const { user } = useAuth();
    const { flash } = usePage<PageProps>().props;

    const totalReports = userStats?.total_reports ?? 0;
    const activeReports = userStats?.active_reports ?? 0;

    const rightAside = (
        <>
            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Your Civic Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-xs font-bold">
                    <div className="flex items-center justify-between">
                        <span className={`flex items-center gap-2 ${theme.textMuted} font-medium`}>
                            <TrendingUp className={`h-4 w-4 ${theme.primaryText}`} />
                            Civic XP Score
                        </span>
                        <span className={`font-black ${theme.primaryText} text-sm`}>{user?.civic_xp ?? 0} XP</span>
                    </div>
                    <div className={`flex items-center justify-between border-t ${theme.dividerColor} pt-2.5`}>
                        <span className={`flex items-center gap-2 ${theme.textMuted} font-medium`}>
                            <FileText className="h-4 w-4 opacity-60" />
                            Total Reports Filed
                        </span>
                        <span>{totalReports}</span>
                    </div>
                    <div className={`flex items-center justify-between border-t ${theme.dividerColor} pt-2.5`}>
                        <span className={`flex items-center gap-2 ${theme.textMuted} font-medium`}>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Active Reports
                        </span>
                        <span>{activeReports}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`flex flex-row items-center justify-between pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Latest Broadcasts</CardTitle>
                    <Link href="/announcements" className={`text-xs font-bold ${theme.primaryText} hover:underline`}>
                        See all →
                    </Link>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                    {announcements.length === 0 ? (
                        <p className={`text-xs ${theme.textMuted} font-medium text-center py-4`}>No active broadcasts.</p>
                    ) : (
                        announcements.slice(0, 2).map((item) => (
                            <AnnouncementCard key={item.id} announcement={item} compact />
                        ))
                    )}
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Community Feed" />
            
            {flash.success && (
                <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs font-bold text-emerald-900 shadow-2xs">
                    <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    {flash.success}
                </div>
            )}

            <ResidentSocialShell right={rightAside}>
                <FeedComposer />

                {concerns.length === 0 ? (
                    <div className={`rounded-2xl border border-dashed ${theme.cardBorder} ${theme.cardBg} p-16 text-center shadow-xs`}>
                        <h3 className="font-black text-base">No public concerns reported yet</h3>
                        <p className={`mt-1 text-xs font-medium ${theme.textMuted} max-w-xs mx-auto leading-relaxed`}>
                            Be the first neighbor to report a community issue and help municipal staff triage operations.
                        </p>
                        <div className="mt-5">
                            <Button asChild className={`${theme.primaryBg} ${theme.primaryHover} text-white font-bold text-xs shadow-sm cursor-pointer`}>
                                <Link href="/concerns/new">Post a Community Concern</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    concerns.map((concern) => <ConcernCard key={concern.id} concern={concern} />)
                )}
            </ResidentSocialShell>
        </ResidentLayout>
    );
}