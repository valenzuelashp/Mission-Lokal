import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { findPublishedAnnouncement, publishedAnnouncements } from '@/Lib/residentDemo';
import type { AnnouncementShowPageProps } from '@/Types';

type Props = Partial<AnnouncementShowPageProps> & {
    announcementId?: string;
};

export default function Show({ announcement, announcementId }: Props) {
    const item =
        announcement ??
        findPublishedAnnouncement(announcementId ?? '') ??
        publishedAnnouncements[0];

    return (
        <ResidentLayout wide>
            <Head title={item.title} />
            
            {/* Fine Light Editorial Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-2 sm:px-4 py-2 space-y-4 w-full">
                {/* Mobile-Friendly Tactile Back Action Anchor */}
                <Button variant="ghost" className="h-8 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2 -ml-1 transition-colors" asChild>
                    <Link href="/announcements">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        All Announcements
                    </Link>
                </Button>

                {/* Main Premium Light Frosted Container Card */}
                <article className="overflow-hidden border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4 sm:p-5 transition-all duration-300">
                    
                    {item.image_url && (
                        <div className="mb-5 overflow-hidden rounded-xl border border-neutral-100">
                            <img
                                src={item.image_url}
                                alt=""
                                className="w-full object-cover opacity-95"
                                style={{ maxHeight: '280px' }}
                            />
                        </div>
                    )}
                    
                    {/* Modern Clean Metadata Section Row */}
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-neutral-400">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/30">
                            <Megaphone className="h-3 w-3" />
                        </div>
                        <span className="truncate">
                            {item.published_at} · By {item.author_name}
                        </span>
                    </div>

                    {/* Premium Typographic Headings */}
                    <h1 className="break-words text-lg font-black tracking-tight text-neutral-950 sm:text-xl leading-tight uppercase text-xs md:text-base border-b border-neutral-100 pb-3">
                        {item.title}
                    </h1>

                    {/* Highly Legible Body Context Flow */}
                    <p className="mt-4 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-medium text-neutral-700">
                        {item.body}
                    </p>
                    
                </article>
            </div>
        </ResidentLayout>
    );
}