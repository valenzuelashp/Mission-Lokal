import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, FileText, Plus, TrendingUp } from 'lucide-react';
import ConcernCard from '@/Components/resident/ConcernCard';
import EmptyState from '@/Components/shared/EmptyState';
import PageHeader from '@/Components/shared/PageHeader';
import StatCard from '@/Components/shared/StatCard';
import { Button } from '@/Components/ui/button';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { FeedPageProps, PageProps } from '@/Types';

export default function Feed({ concerns }: FeedPageProps) {
    const { user } = useAuth();
    const { flash } = usePage<PageProps>().props;

    return (
        <ResidentLayout>
            <Head title="Feed" />
            {flash.success && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {flash.success}
                </div>
            )}
            <PageHeader
                title="Public Feed"
                description="See what your barangay is working on. Upvote concerns that matter to you."
                action={
                    <Button asChild>
                        <Link href="/concerns/new">
                            <Plus className="h-4 w-4" />
                            Post concern
                        </Link>
                    </Button>
                }
            />

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Open reports" value={concerns.length} icon={FileText} />
                <StatCard label="Your XP" value={user?.civic_xp ?? 0} icon={TrendingUp} hint="Civic points" />
                <StatCard label="Active" value={concerns.filter((c) => c.status === 'active').length} icon={AlertCircle} hint="Being addressed" />
            </div>

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
                <div className="grid gap-4">
                    {concerns.map((concern) => (
                        <ConcernCard key={concern.id} concern={concern} />
                    ))}
                </div>
            )}
        </ResidentLayout>
    );
}
