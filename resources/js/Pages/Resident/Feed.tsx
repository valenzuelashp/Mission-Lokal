import { Head, Link, usePage } from '@inertiajs/react';
import { AlertCircle, FileText, Award, MapPin, ArrowRight, Bell } from 'lucide-react';
import AnnouncementCard from '@/Components/resident/AnnouncementCard';
import ConcernCard from '@/Components/resident/ConcernCard';
import FeedComposer from '@/Components/resident/FeedComposer';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import EmptyState from '@/Components/shared/EmptyState';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { publishedAnnouncements } from '@/Lib/residentDemo';
import type { FeedPageProps, PageProps } from '@/Types';

export default function Feed({ concerns }: FeedPageProps) {
    const { user } = useAuth();
    const { flash } = usePage<PageProps>().props;
    const activeCount = concerns.filter((c) => c.status === 'active').length;

    // Calculate progression percentage toward the next 100 XP tier milestone
    const currentXp = user?.civic_xp ?? 0;
    const nextMilestone = Math.ceil((currentXp + 1) / 100) * 100 || 100;
    const prevMilestone = nextMilestone - 100;
    const xpBarProgress = Math.min(((currentXp - prevMilestone) / 100) * 100, 100);

    const rightAside = (
        <div className="space-y-4 sm:space-y-6">
            {/* Impact Sidebar Card with Linear Level Progress Bar System */}
            <Card className="relative overflow-hidden border-neutral-200/60 bg-white shadow-sm rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-800">Your Civic Impact</CardTitle>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full border border-neutral-200/40">
                        <MapPin className="h-2.5 w-2.5 text-neutral-400" /> Central
                    </span>
                </div>
                
                <div className="space-y-4">
                    {/* Linear Premium Progress Tracking Layout */}
                    <div className="bg-neutral-50/50 border border-neutral-200/40 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-neutral-800 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-wider text-neutral-800">Civic Tier Progress</span>
                            </div>
                            <span className="text-xs font-black text-neutral-900 tabular-nums">
                                {currentXp} <span className="text-[10px] text-neutral-400 font-medium">XP</span>
                            </span>
                        </div>

                        {/* Visual Progress Bar Track */}
                        <div className="w-full h-2 bg-neutral-100 rounded-full border border-neutral-200/40 overflow-hidden">
                            <div 
                                className="h-full bg-neutral-900 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${xpBarProgress}%` }}
                            />
                        </div>

                        <div className="flex justify-between text-[9px] font-black text-neutral-400 uppercase tracking-wider">
                            <span>{prevMilestone} XP</span>
                            <span>{nextMilestone} XP Milestone</span>
                        </div>
                    </div>

                    {/* Stats Rows Grid Panel */}
                    <div className="grid grid-cols-2 gap-3 pt-0.5">
                        <div className="flex flex-col p-3 bg-neutral-50/30 border border-neutral-200/40 rounded-xl">
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                <FileText className="h-3.5 w-3.5 text-neutral-400" /> Filed
                            </span>
                            <span className="text-xl font-black text-neutral-900 mt-1">{concerns.length}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-neutral-50/30 border border-neutral-200/40 rounded-xl">
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                <AlertCircle className="h-3.5 w-3.5 text-neutral-400" /> Active
                            </span>
                            <span className="text-xl font-black text-neutral-900 mt-1">{activeCount}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Bulletins Panel (Touch-friendly lists for mobile navigation) */}
            <Card className="border-neutral-200/60 bg-white shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-white/40 border-b border-neutral-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-800">
                            <Bell className="h-3.5 w-3.5" />
                        </div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-800">Latest Bulletins</CardTitle>
                    </div>
                    <Link href="/announcements" className="group text-xs font-bold text-neutral-900 flex items-center gap-0.5 hover:opacity-70 transition-opacity">
                        View All
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </CardHeader>
                <CardContent className="p-3 space-y-3 divide-y divide-neutral-100">
                    {publishedAnnouncements.slice(0, 2).map((item, idx) => (
                        <div key={item.id} className={idx > 0 ? "pt-3" : ""}>
                            <AnnouncementCard announcement={item} compact />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title="Public Feed" />

            {/* Mobile View Container: Drops extreme layout padding layout constraints */}
            <div className="w-full space-y-2 sm:space-y-4 px-0 sm:px-4 md:px-6">
                {flash.success && (
                    <div className="mx-4 sm:mx-1 flex items-center gap-2 border border-emerald-200 bg-emerald-50 rounded-xl px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in duration-200">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">{flash.success}</span>
                    </div>
                )}

                <ResidentSocialShell right={rightAside}>
                    {/* Compact App-Style Header Composer Input wrapper slot */}
                    <div className="w-full bg-white border-y sm:border border-slate-200/80 sm:rounded-xl shadow-sm mb-1">
                        <FeedComposer />
                    </div>

                    {concerns.length === 0 ? (
                        <div className="bg-white border-y sm:border border-slate-200/80 sm:rounded-xl p-10 text-center shadow-sm mx-0">
                            <EmptyState
                                title="No public concerns yet"
                                description="Be the first to report an active issue on your residential block."
                            >
                                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-5 py-2 shadow-sm text-xs transition-all active:scale-[0.98]">
                                    <Link href="/concerns/new">Post a concern</Link>
                                </Button>
                            </EmptyState>
                        </div>
                    ) : (
                        <div className="space-y-2 sm:space-y-3">
                            {concerns.map((concern) => (
                                <div key={concern.id} className="bg-white border-y sm:border border-slate-200/80 sm:rounded-xl shadow-sm overflow-hidden transition-all duration-150">
                                    <ConcernCard concern={concern} />
                                </div>
                            ))}
                        </div>
                    )}
                </ResidentSocialShell>
            </div>
        </ResidentLayout>
    );
}