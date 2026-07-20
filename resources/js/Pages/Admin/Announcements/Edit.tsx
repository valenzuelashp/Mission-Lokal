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
            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-transparent" asChild>
                <Link href="/admin/announcements">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                    Back to advisory list
                </Link>
            </Button>

            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Edit announcement</h2>
                <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                    Modify active context structures, refresh cover imagery arrays, or update visibility configurations.
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