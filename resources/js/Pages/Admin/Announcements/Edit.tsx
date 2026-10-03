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
                <div className="p-12 text-center text-sm font-bold text-red-600 bg-white rounded-2xl border">
                    Specified announcement record could not be resolved in database storage.
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Mission-Lokal Admin: Edit Announcement">
            <Head title={`Edit: ${announcement.title}`} />
            
            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/announcements">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Announcements Registry
                    </Link>
                </Button>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <Megaphone className="h-6 w-6 text-blue-600" />
                    Modify Broadcast Announcement
                </h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    Update content text, schedule, or publication state for barangay distribution.
                </p>
            </div>

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
        </AdminLayout>
    );
}