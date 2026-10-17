import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import AnnouncementForm from '@/Components/admin/AnnouncementForm';
import { Button } from '@/Components/ui/button';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
    return (
        <AdminLayout title="Mission-Lokal Admin: New Announcement">
            <Head title="New Announcement" />
            
            <div className="w-full space-y-8 pb-16">
                
                {/* Top Back Navigation Bar */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                    <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-all rounded-xl" asChild>
                        <Link href="/admin/announcements" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4 text-slate-500" /> Back to Annoucnements
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
                            Broadcast New Announcement
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Draft a public advisory, community event, or volunteer call for active resident feeds.
                        </p>
                    </div>
                </div>

                {/* Form Wrapper Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                    <AnnouncementForm
                        action="/admin/announcements"
                        method="post"
                        cancelHref="/admin/announcements"
                        submitLabel="Save Announcement Draft"
                        defaults={{ title: '', body: '', kind: 'advisory', event_at: '', is_published: false, image: null, remove_image: false }}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}