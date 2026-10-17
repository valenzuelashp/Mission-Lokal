import { Head } from '@inertiajs/react';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import AdminLayout from '@/Layouts/AdminLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    return (
        <AdminLayout title="Mission-Lokal Admin: Calendar">
            <Head title="Operations Calendar" />
            
            <div className="w-full space-y-8 pb-16">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Sparkles className="h-3 w-3" /> Scheduling & Telemetry Suite
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                            <CalendarIcon className="h-7 w-7 text-blue-600" /> Municipal Operations Calendar
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Synchronized schedule tracking advisories, events, volunteer operations, and mission deadlines.
                        </p>
                    </div>
                </div>

                {/* Main Calendar Container with Full Width & Soft Rounded Depth */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xs">
                    <CalendarMonthView
                        {...props}
                        basePath="/admin/calendar"
                        heading=""
                        description=""
                        legend={['announcement', 'mission']}
                        split
                    />
                </div>
            </div>
        </AdminLayout>
    );
}