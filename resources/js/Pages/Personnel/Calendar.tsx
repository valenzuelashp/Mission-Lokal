import { Head } from '@inertiajs/react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    return (
        <PersonnelLayout title="Mission-Lokal Personnel: Calendar">
            <Head title="Field Calendar" />
            <CalendarMonthView
                {...props}
                basePath="/personnel/calendar"
                heading="Assigned Field Calendar"
                description="Synchronized schedule tracking mission deadlines, municipal events, and community alerts."
                legend={['announcement', 'mission']}
                split
            />
        </PersonnelLayout>
    );
}