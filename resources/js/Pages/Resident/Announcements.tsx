import { Head, Link } from '@inertiajs/react';
import { Megaphone, Shield } from 'lucide-react';
import AnnouncementCard from '@/Components/resident/AnnouncementCard';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import EmptyState from '@/Components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { publishedAnnouncements } from '@/Lib/residentDemo';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { AnnouncementsPageProps } from '@/Types';

export default function Announcements(props: Partial<AnnouncementsPageProps>) {
    const theme = useResidentTheme();
    const announcements = props.announcements ?? publishedAnnouncements;

    const rightAside = (
        <div className="space-y-6">
            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <Shield className={`h-4 w-4 ${theme.primaryText}`} />
                        Barangay Broadcasts
                    </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-3 text-xs ${theme.textMuted} pt-4 font-medium leading-relaxed`}>
                    <p>Official advisories, community events, and volunteer calls published directly by municipal administrators.</p>
                    <p className={`font-black ${theme.primaryText} pt-1`}>
                        {announcements.length} active broadcast{announcements.length !== 1 ? 's' : ''} online
                    </p>
                </CardContent>
            </Card>

            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Community Feed</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <Link href="/feed" className={`text-xs font-bold ${theme.primaryText} hover:underline`}>
                        View public community concern feed →
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Announcements" />

            <ResidentSocialShell right={rightAside}>
                <div className="w-full space-y-6">
                    <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardContent className="flex items-center gap-5 p-6 sm:p-8">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border shadow-md`}>
                                <Megaphone className={`h-7 w-7 ${theme.primaryText}`} />
                            </div>
                            <div className="min-w-0">
                                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.textMain}`}>Barangay Announcements</h1>
                                <p className={`text-xs sm:text-sm font-medium ${theme.textMuted} mt-1 leading-relaxed`}>
                                    Official advisories, schedule updates, and emergency alerts
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {announcements.length === 0 ? (
                        <EmptyState
                            title="No announcements published yet"
                            description="Check back later for official barangay advisories and community updates."
                        />
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((item) => <AnnouncementCard key={item.id} announcement={item} />)}
                        </div>
                    )}
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}