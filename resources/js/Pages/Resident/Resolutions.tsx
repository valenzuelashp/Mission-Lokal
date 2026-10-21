import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import MissionResolutionCard from '@/Components/resident/MissionResolutionCard';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import EmptyState from '@/Components/shared/EmptyState';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type ResolutionPost = {
    id: string;
    title: string;
    body: string;
    photos: string[];
    published_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ResolutionPaginator = {
    data: ResolutionPost[];
    links: PaginationLink[];
};

export default function Resolutions({ resolutionPosts }: { resolutionPosts: ResolutionPaginator }) {
    const theme = useResidentTheme();
    const posts = resolutionPosts.data;

    return (
        <ResidentLayout wide>
            <Head title="Community Resolutions" />

            <ResidentSocialShell>
                <div className="w-full space-y-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className={`h-7 w-7 ${theme.primaryText}`} />
                        <div>
                            <h1 className={`text-2xl font-black tracking-tight ${theme.textMain}`}>Verified Community Resolutions</h1>
                            <p className={`mt-1 text-sm font-medium ${theme.textMuted}`}>
                                Completed community work, shared with residents.
                            </p>
                        </div>
                    </div>

                    {posts.length === 0 ? (
                        <EmptyState
                            title="No community resolutions published yet"
                            description="Verified resolutions will appear here once they are shared."
                        />
                    ) : (
                        <>
                            <div className="space-y-4">
                                {posts.map((update) => <MissionResolutionCard key={update.id} update={update} />)}
                            </div>

                            <nav className="flex flex-wrap justify-center gap-2" aria-label="Resolution pages">
                                {resolutionPosts.links.map((link, index) => (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        aria-current={link.active ? 'page' : undefined}
                                        aria-disabled={link.url === null}
                                        className={`rounded-xl border px-3 py-2 text-xs font-bold ${
                                            link.active
                                                ? `${theme.primaryBg} border-transparent text-white`
                                                : `${theme.cardBorder} ${theme.textMain}`
                                        } ${link.url === null ? 'pointer-events-none opacity-50' : 'hover:opacity-80'}`}
                                    >
                                        {link.label.replace(/&laquo;|&raquo;/g, (entity) => entity === '&laquo;' ? '«' : '»')}
                                    </Link>
                                ))}
                            </nav>
                        </>
                    )}

                    <Link href="/feed" className={`inline-block text-xs font-bold ${theme.primaryText} hover:underline`}>
                        ← Back to community feed
                    </Link>
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}
