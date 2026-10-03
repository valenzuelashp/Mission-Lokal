import { Head } from '@inertiajs/react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import AdminLayout from '@/Layouts/AdminLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Calendar">
            <Head title="Operations Calendar" />
            <CalendarMonthView
                {...props}
                basePath="/admin/calendar"
                heading="Municipal Operations Calendar"
                description="Synchronized schedule tracking advisories, events, volunteer operations, and mission deadlines."
                legend={['announcement', 'mission']}
                split
            />
        </AdminLayout>
    );
}