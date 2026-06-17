import { Head, Link } from '@inertiajs/react';
import { Scale, Search, Shield } from 'lucide-react';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { blotterTypes } from '@/Lib/residentDemo';

const icons = {
    'two-party': Scale,
    'one-party': Search,
};

export default function TypeSelect() {
    const rightAside = (
        <>
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4 text-primary" />
                        Katarungang Pambarangay
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        Blotter records are handled by barangay staff. Two-party cases may proceed to mediation;
                        one-party reports are logged for follow-up missions.
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Privacy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>
                        Sensitive cases (VAWC, domestic disputes) are kept private and never appear on the public
                        feed.
                    </p>
                </CardContent>
            </Card>
        </>
    );

    return (
        <ResidentLayout wide>
            <Head title="File Blotter" />

            <ResidentSocialShell right={rightAside}>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <h1 className="text-xl font-bold">File a blotter</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Katarungang Pambarangay records for disputes and incidents that need formal documentation.
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                    {blotterTypes.map((item) => {
                        const Icon = icons[item.type];
                        return (
                            <Link key={item.type} href={`/blotter/new/${item.type}`}>
                                <Card className="h-full shadow-sm transition-shadow hover:border-primary/40 hover:shadow-md">
                                    <CardHeader>
                                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground">Examples: {item.examples}</p>
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
