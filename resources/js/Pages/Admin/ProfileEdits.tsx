import AdminLayout from '@/Layouts/AdminLayout';
import StubPage from '@/Components/shared/StubPage';

export default function ProfileEdits() {
    return (
        <AdminLayout title="Mission-Lokal Admin: Profile Revision Queue">
            <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-6 shadow-sm">
                <StubPage title="Profile Verification Revisions" />
            </div>
        </AdminLayout>
    );
}