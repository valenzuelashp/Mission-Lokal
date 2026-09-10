import { Head } from '@inertiajs/react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import AdminLayout from '@/Layouts/AdminLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Calendar">
            <Head title="Operations calendar" />
            <CalendarMonthView
                {...props}
                basePath="/admin/calendar"
                heading="Operations calendar"
                description="Advisories and mission due dates across the barangay."
                legend={['announcement', 'mission']}
                split
            />
        </AdminLayout>
    );
}
