import { Head, Link } from '@inertiajs/react';
import { Megaphone, Shield } from 'lucide-react';
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
        <>
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4 text-primary" />
                        Barangay Demo
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Official advisories, emergency alerts, and community updates from your barangay hall.</p>
                    <p className="text-xs">
                        {announcements.length} published post{announcements.length !== 1 ? 's' : ''}
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Community feed</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href="/feed" className="text-sm font-medium text-primary hover:underline">
                        View public concern feed →
                    </Link>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Announcements" />

            <ResidentSocialShell right={rightAside}>
                <Card className="shadow-sm">
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold">Barangay announcements</h1>
                            <p className="text-sm text-muted-foreground">
                                Advisories and updates from Demo Barangay officials
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {announcements.length === 0 ? (
                    <EmptyState
                        title="No announcements yet"
                        description="Check back later for barangay advisories and community updates."
                    />
                ) : (
                    announcements.map((item) => <AnnouncementCard key={item.id} announcement={item} />)
                )}
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
