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
        <>
            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <Shield className={`h-4 w-4 ${theme.primaryText}`} />
                        Barangay Broadcasts
                    </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-2 text-xs ${theme.textMuted} pt-3 font-medium leading-relaxed`}>
                    <p>Official advisories, community events, and volunteer calls published directly by municipal administrators.</p>
                    <p className={`font-bold ${theme.primaryText} pt-1`}>
                        {announcements.length} active broadcast{announcements.length !== 1 ? 's' : ''} online
                    </p>
                </CardContent>
            </Card>

            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Community Feed</CardTitle>
                </CardHeader>
                <CardContent className="pt-3">
                    <Link href="/feed" className={`text-xs font-bold ${theme.primaryText} hover:underline`}>
                        View public community concern feed →
                    </Link>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Announcements" />

            <ResidentSocialShell right={rightAside}>
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white shadow-md`}>
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-black tracking-tight">Barangay Announcements</h1>
                            <p className={`text-xs font-medium ${theme.textMuted} mt-0.5`}>
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
                    announcements.map((item) => <AnnouncementCard key={item.id} announcement={item} />)
                )}
            </ResidentSocialShell>
        </ResidentLayout>
    );
}