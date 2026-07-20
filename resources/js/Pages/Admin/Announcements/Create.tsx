import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AnnouncementForm from '@/Components/admin/AnnouncementForm';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
    return (
        <AdminLayout title="Mission-Lokal Admin: New Announcement">
            <Head title="New Announcement" />
            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-transparent" asChild>
                <Link href="/admin/announcements">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                    Back to advisory list
                </Link>
            </Button>

            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">New announcement</h2>
                <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                    Draft an advisory bulletin or establish immediate packet broadcast parameters across resident public feeds.
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