import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AnnouncementForm from '@/Components/admin/AnnouncementForm';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoAnnouncements, findAnnouncement } from '@/Lib/adminDemo';
import type { AdminAnnouncementFormPageProps } from '@/Types';

type Props = Partial<AdminAnnouncementFormPageProps> & {
    announcementId?: string;
};

export default function Edit({ announcement, announcementId }: Props) {
    const item =
        announcement ??
        findAnnouncement(announcementId ?? '') ??
        demoAnnouncements[0];

    return (
        <AdminLayout title="Mission-Lokal Admin: Edit Announcement">
            <Head title={`Edit: ${item.title}`} />
            <Button variant="ghost" className="mb-3 -ml-2 h-auto px-2 text-sm sm:mb-4" asChild>
                <Link href="/admin/announcements">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to announcements
                </Link>
            </Button>

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Edit announcement</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Update content or change publish status for residents.
                </p>
            </div>

            <AnnouncementForm
                action={`/admin/announcements/${item.id}`}
                method="put"
                cancelHref="/admin/announcements"
                submitLabel="Save changes"
                existingImageUrl={item.image_url}
                defaults={{
                    title: item.title,
                    body: item.body,
                    is_published: item.is_published,
                    image: null,
                    remove_image: false,
                }}
            />
        </AdminLayout>
    );
}
