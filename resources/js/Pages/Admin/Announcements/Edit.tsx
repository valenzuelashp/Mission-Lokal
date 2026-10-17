import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import AnnouncementForm from '@/Components/admin/AnnouncementForm';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';
import type { AdminAnnouncementFormPageProps } from '@/Types';

type Props = Partial<AdminAnnouncementFormPageProps> & {
    announcementId?: string;
};

export default function Edit({ announcement }: Props) {
    if (!announcement) {
        return (
            <AdminLayout title="Announcement Not Found">
                <div className="w-full py-16">
                    <div className="p-12 text-center text-sm font-bold text-red-600 bg-white rounded-3xl border border-red-200 shadow-2xs">
                        Specified announcement record could not be resolved in database storage.
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Mission-Lokal Admin: Edit Announcement">
            <Head title={`Edit: ${announcement.title}`} />
            
            <div className="w-full space-y-8 pb-16">
                
                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                        <Link href="/admin/announcements" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Announcements
                        </Link>
                    </Button>
                </div>

                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Megaphone className="h-3 w-3" /> Public Broadcast Center
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Modify Broadcast Announcement
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Update content text, schedule, or publication state for barangay distribution.
                        </p>
                    </div>
                </div>

                {/* Form Wrapper Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                    <AnnouncementForm
                        action={`/admin/announcements/${announcement.id}`}
                        method="put"
                        cancelHref="/admin/announcements"
                        submitLabel="Save Updates"
                        existingImageUrl={announcement.image_url}
                        volunteers={announcement.volunteers}
                        defaults={{
                            title: announcement.title,
                            body: announcement.body,
                            kind: announcement.kind ?? 'advisory',
                            event_at: announcement.event_at_input ?? '',
                            is_published: announcement.is_published,
                            image: null,
                            remove_image: false,
                        }}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}