import { Head } from '@inertiajs/react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    return (
        <PersonnelLayout title="Mission-Lokal Personnel: Calendar">
            <Head title="Calendar" />
            <CalendarMonthView
                {...props}
                basePath="/personnel/calendar"
                heading="My calendar"
                description="Assigned mission due dates and published barangay advisories."
                legend={['announcement', 'mission']}
                split
            />
        </PersonnelLayout>
    );
}
