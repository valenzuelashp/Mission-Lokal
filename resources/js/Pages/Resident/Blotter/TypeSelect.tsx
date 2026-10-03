import { Head, Link } from '@inertiajs/react';
import { Scale, Search, Shield } from 'lucide-react';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
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
        <>
            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <Shield className={`h-4 w-4 ${theme.primaryText}`} />
                        Katarungang Pambarangay
                    </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-2 text-xs ${theme.textMuted} pt-3 font-medium leading-relaxed`}>
                    <p>Formal blotter entries are verified by staff. Two-party complaints are scheduled for official mediation; one-party reports are logged for municipal records.</p>
                </CardContent>
            </Card>

            <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                <CardHeader className={`pb-3 border-b ${theme.dividerColor}`}>
                    <CardTitle className="text-xs font-black uppercase tracking-wider">Strict Privacy Protocol</CardTitle>
                </CardHeader>
                <CardContent className={`pt-3 text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                    <p>Sensitive cases (VAWC, domestic disputes) are permanently hidden from public feeds and restricted to administrative review only.</p>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="File Blotter" />

            <ResidentSocialShell right={rightAside}>
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardContent className="p-6">
                        <h1 className="text-2xl font-black tracking-tight">File a Formal Blotter</h1>
                        <p className={`mt-1 text-xs sm:text-sm font-medium ${theme.textMuted}`}>
                            Select the appropriate Katarungang Pambarangay classification for your dispute or incident report.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                    {blotterTypes.map((item) => {
                        const Icon = icons[item.type as keyof typeof icons] || Scale;
                        return (
                            <Link key={item.type} href={`/blotter/new/${item.type}`} className="block group">
                                <Card className={`h-full shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl transition-all hover:border-blue-300 hover:shadow-md`}>
                                    <CardHeader className="pb-3">
                                        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border group-hover:scale-105 transition-transform`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className={`text-base font-black ${theme.primaryText} transition-colors`}>{item.title}</CardTitle>
                                        <CardDescription className={`text-xs leading-relaxed font-medium mt-1 ${theme.textMuted}`}>{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <p className={`text-[11px] font-semibold ${theme.textMuted} bg-slate-50/50 p-2.5 rounded-xl border ${theme.dividerColor}`}>Examples: {item.examples}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}