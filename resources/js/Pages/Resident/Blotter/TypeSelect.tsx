import { Head, Link } from '@inertiajs/react';
import { Scale, Search, Shield } from 'lucide-react';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { blotterTypes } from '@/Lib/residentDemo';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

const icons = {
    'two-party': Scale,
    'one-party': Search,
};

export default function TypeSelect() {
    const theme = useResidentTheme();

    const rightAside = (
        <div className="space-y-6">
            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <Shield className={`h-4 w-4 ${theme.primaryText}`} />
                        Katarungang Pambarangay
                    </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-3 text-xs ${theme.textMuted} pt-4 font-medium leading-relaxed`}>
                    <p>Formal blotter entries are verified by staff. Two-party complaints are scheduled for official mediation; one-party reports are logged for municipal records.</p>
                </CardContent>
            </Card>

            <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                <CardHeader className={`pb-4 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Strict Privacy Protocol</CardTitle>
                </CardHeader>
                <CardContent className={`pt-4 text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                    <p>Sensitive cases (VAWC, domestic disputes) are permanently hidden from public feeds and restricted to administrative review only.</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="File Blotter" />

            <ResidentSocialShell right={rightAside}>
                <div className="space-y-6 w-full">
                    <Card className={`shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardContent className="p-6 sm:p-8">
                            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.textMain}`}>File a Formal Blotter</h1>
                            <p className={`mt-2 text-xs sm:text-sm font-medium ${theme.textMuted} leading-relaxed`}>
                                Select the appropriate Katarungang Pambarangay classification for your dispute or incident report.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {blotterTypes.map((item) => {
                            const Icon = icons[item.type as keyof typeof icons] || Scale;
                            return (
                                <Link key={item.type} href={`/blotter/new/${item.type}`} className="block group">
                                    <Card className={`h-full shadow-2xs ${theme.cardBorder} ${theme.cardBg} ${theme.cardHoverBorder} rounded-3xl transition-all hover:shadow-md p-2`}>
                                        <CardHeader className="pb-4 pt-6 px-6">
                                            <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border group-hover:scale-105 transition-transform shadow-2xs`}>
                                                <Icon className="h-7 w-7" />
                                            </div>
                                            <CardTitle className={`text-base font-black ${theme.primaryText} transition-colors`}>{item.title}</CardTitle>
                                            <p className={`text-xs leading-relaxed font-semibold mt-1.5 ${theme.textMuted}`}>{item.description}</p>
                                        </CardHeader>
                                        <CardContent className="px-6 pb-6 pt-0">
                                            <p className={`text-[11px] font-bold ${theme.textMuted} ${theme.inputBg} p-3 rounded-2xl border ${theme.dividerColor}`}>Examples: {item.examples}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}