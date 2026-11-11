import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminOverviewTabs from '@/Components/admin/AdminOverviewTabs';
import DashboardAnalytics from '@/Components/admin/DashboardAnalytics';
import type { DashboardAnalyticsData } from '@/Types/dashboardAnalytics';

export default function Analytics({ analytics }: { analytics: DashboardAnalyticsData }) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Analytics">
            <Head title="Analytics" />
            <div className="w-full space-y-6 pb-8">
                <AdminOverviewTabs active="analytics" />
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Barangay analytics</h1>
                    <p className="mt-2 text-sm text-slate-500">Explore community concerns, mission progress, and response trends.</p>
                </div>
                <DashboardAnalytics analytics={analytics} />
            </div>
        </AdminLayout>
    );
}
