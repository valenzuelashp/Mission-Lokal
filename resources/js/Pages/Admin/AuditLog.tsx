import AdminLayout from '@/Layouts/AdminLayout';
import StubPage from '@/Components/shared/StubPage';

export default function AuditLog() {
    return (
        <AdminLayout title="Mission-Lokal Admin: System Audit Logs">
            <div className="rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md p-6 shadow-sm">
                <StubPage title="System Audit Logs Ledger" />
            </div>
        </AdminLayout>
    );
}