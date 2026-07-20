import AdminLayout from '@/Layouts/AdminLayout';
import StubPage from '@/Components/shared/StubPage';

export default function Settings() {
    return (
        <AdminLayout title="Mission-Lokal Admin: Core Configuration parameters">
            <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-6 shadow-sm">
                <StubPage title="System Environment Configuration settings" />
            </div>
        </AdminLayout>
    );
}