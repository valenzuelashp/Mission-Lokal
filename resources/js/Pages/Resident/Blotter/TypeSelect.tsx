import { Head, Link } from '@inertiajs/react';
import { Scale, Search, Shield, ArrowRight } from 'lucide-react';
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
        <div className="space-y-4">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4">
                <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-neutral-400" /> Katarungang Pambarangay
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-xs font-medium text-neutral-500 leading-relaxed">
                    <p>Blotter records are handled securely by barangay staff. Two-party cases may proceed to formal mediation sessions; one-party reports are logged for strategic record documentation.</p>
                </CardContent>
            </Card>

            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4">
                <CardHeader className="p-0 pb-1">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Privacy Integrity</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-xs font-medium text-neutral-500 leading-relaxed">
                    <p>Sensitive tracking categories (such as VAWC or internal domestic disputes) are permanently enforced as private visibility and will never reveal on open feed streams.</p>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="File Blotter" />

            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 space-y-4 w-full px-2 sm:px-4 md:px-6">
                <Card className="overflow-hidden border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                    <CardContent className="p-4 sm:p-5">
                        <h1 className="text-sm font-black tracking-wider text-neutral-950 uppercase">File a Blotter</h1>
                        <p className="mt-0.5 text-xs font-medium text-neutral-400">
                            Formal documentation records for disputes or local incidents requiring secure legal tracking.
                        </p>
                    </CardContent>
                </Card>

                <ResidentSocialShell right={rightAside}>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {blotterTypes.map((item) => {
                            const Icon = icons[item.type];
                            return (
                                <Link key={item.type} href={`/blotter/new/${item.type}`} className="block group">
                                    <Card className="h-full border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-4 transition-all duration-300 hover:border-neutral-300 hover:shadow-md flex flex-col justify-between">
                                        <CardHeader className="p-0 space-y-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 border border-neutral-200/40">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-black tracking-tight text-neutral-950 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                                    {item.title} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                                                </CardTitle>
                                                <CardDescription className="text-xs font-medium text-neutral-400 leading-normal">{item.description}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0 mt-3 pt-3 border-t border-neutral-100/70">
                                            <p className="text-[11px] font-medium text-neutral-500 leading-relaxed">
                                                <span className="font-bold text-neutral-400 uppercase text-[10px] tracking-wider block mb-0.5">Context Cases</span> 
                                                {item.examples}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}