import AdminLayout from '@/Layouts/AdminLayout';
import StubPage from '@/Components/shared/StubPage';

export default function Index() {
    return (
        <AdminLayout title="Mission-Lokal Admin: Blotter Ledger">
            <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-6 shadow-sm">
                <StubPage title="Blotters Ledger System" />
            </div>
        </AdminLayout>
    );
}