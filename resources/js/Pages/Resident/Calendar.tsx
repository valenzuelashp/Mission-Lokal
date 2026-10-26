import { Head } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import CalendarMonthView from '@/Components/calendar/CalendarMonthView';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { CalendarPageProps } from '@/Types';

export default function Calendar(props: CalendarPageProps) {
    const theme = useResidentTheme();

    const rightAside = (
        <div className="space-y-6">
            <Card className={`overflow-hidden border ${theme.cardBorder} shadow-2xs rounded-3xl ${theme.cardBg}`}>
                <div className={`bg-gradient-to-br ${theme.primaryBg} px-6 py-5 text-white`}>
                    <p className="text-xs font-black uppercase tracking-widest opacity-85">Schedule Overview</p>
                    <h3 className="text-sm font-bold mt-1">Municipal Calendar Grid</h3>
                </div>
                <CardContent className="space-y-4 p-6 text-xs font-medium">
                    <div className="flex gap-3.5 items-center">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border shadow-2xs`}>
                            <Bell className="h-5 w-5" />
                        </span>
                        <p className={`${theme.textMuted} leading-relaxed`}>
                            <strong className="font-bold">Advisories, events, and volunteer calls</strong> published directly from the barangay hall.
                        </p>
                    </div>
                    <p className={`flex items-start gap-2.5 rounded-2xl ${theme.badgeBg} px-4 py-3 ${theme.badgeText} border ${theme.badgeBorder} font-bold shadow-2xs`}>
                        <span>✓ Volunteer calls you sign up for are automatically marked <strong className="font-black">Going</strong>.</span>
                    </p>
                </CardContent>
            </Card>

        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Calendar" />
            <ResidentSocialShell right={rightAside}>
                <div className="w-full">
                    <CalendarMonthView
                        {...props}
                        basePath="/calendar"
                        heading="Municipal Community Calendar"
                        description={`Schedule of events, assemblies, and deadlines for ${props.month_label}.`}
                        legend={['announcement']}
                        split
                    />
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}