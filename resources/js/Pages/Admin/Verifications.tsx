import AdminLayout from '@/Layouts/AdminLayout';
import StubPage from '@/Components/shared/StubPage';

export default function Verifications() {
    return (
        <AdminLayout title="Mission-Lokal Admin: Credential Auditing Queue">
            <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-6 shadow-sm">
                <StubPage title="Identity Verification Pipeline" />
            </div>
        </AdminLayout>
    );
}