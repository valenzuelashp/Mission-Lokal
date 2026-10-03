import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import AnnouncementForm from '@/Components/admin/AnnouncementForm';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
    return (
        <AdminLayout title="Mission-Lokal Admin: New Announcement">
            <Head title="New Announcement" />
            
            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href="/admin/announcements">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Announcements Registry
                    </Link>
                </Button>
            </div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Megaphone className="h-6 w-6 text-blue-600" />
                        Broadcast New Announcement
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                        Draft a public advisory, community event, or volunteer call for active resident feeds.
                    </p>
                </div>
            </div>

            <AnnouncementForm
                action="/admin/announcements"
                method="post"
                cancelHref="/admin/announcements"
                submitLabel="Save Announcement Draft"
                defaults={{ title: '', body: '', kind: 'advisory', event_at: '', is_published: false, image: null, remove_image: false }}
            />
        </AdminLayout>
    );
}