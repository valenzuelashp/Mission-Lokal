import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AnnouncementForm from '@/Components/admin/AnnouncementForm';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
    return (
        <AdminLayout title="Mission-Lokal Admin: New Announcement">
            <Head title="New Announcement" />
            <Button variant="ghost" className="mb-4 -ml-2" asChild>
                <Link href="/admin/announcements">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to announcements
                </Link>
            </Button>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-blue-900">New announcement</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Draft an advisory or publish it immediately to the resident feed.
                </p>
            </div>

            <AnnouncementForm
                action="/admin/announcements"
                method="post"
                cancelHref="/admin/announcements"
                submitLabel="Save announcement"
                defaults={{ title: '', body: '', is_published: false, image: null, remove_image: false }}
            />
        </AdminLayout>
    );
}
