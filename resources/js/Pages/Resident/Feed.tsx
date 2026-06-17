import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, FileText, TrendingUp } from 'lucide-react';
import AnnouncementCard from '@/Components/resident/AnnouncementCard';
import ConcernCard from '@/Components/resident/ConcernCard';
import FeedComposer from '@/Components/resident/FeedComposer';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import EmptyState from '@/Components/shared/EmptyState';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { publishedAnnouncements } from '@/Lib/residentDemo';
import type { FeedPageProps, PageProps } from '@/Types';

export default function Feed({ concerns }: FeedPageProps) {
    const { user } = useAuth();
    const { flash } = usePage<PageProps>().props;
    const activeCount = concerns.filter((c) => c.status === 'active').length;

    const rightAside = (
        <>
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Your civic impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            Civic XP
                        </span>
                        <span className="font-bold text-primary">{user?.civic_xp ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Open reports
                        </span>
                        <span className="font-semibold">{concerns.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            Active
                        </span>
                        <span className="font-semibold">{activeCount}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">Latest announcements</CardTitle>
                    <Link href="/announcements" className="text-xs font-medium text-primary hover:underline">
                        See all
                    </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                    {publishedAnnouncements.slice(0, 2).map((item) => (
                        <AnnouncementCard key={item.id} announcement={item} compact />
                    ))}
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="Feed" />
            {flash.success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {flash.success}
                </div>
            )}

            <ResidentSocialShell right={rightAside}>
                <FeedComposer />

                {concerns.length === 0 ? (
                    <EmptyState
                        title="No public concerns yet"
                        description="Be the first to report a community issue in your barangay."
                    >
                        <Button asChild>
                            <Link href="/concerns/new">Post a concern</Link>
                        </Button>
                    </EmptyState>
                ) : (
                    concerns.map((concern) => <ConcernCard key={concern.id} concern={concern} />)
                )}
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
