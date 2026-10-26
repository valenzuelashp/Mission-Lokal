import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Bell, CalendarDays, HandHelping, Megaphone, Radio, UserRound } from 'lucide-react';
import VolunteerJoinButton from '@/Components/resident/VolunteerJoinButton';
import BufferedImage from '@/Components/shared/BufferedImage';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import ResidentSocialShell from '@/Components/resident/ResidentSocialShell';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { findPublishedAnnouncement, publishedAnnouncements } from '@/Lib/residentDemo';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { AnnouncementKind, AnnouncementShowPageProps } from '@/Types';

type Props = Partial<AnnouncementShowPageProps> & {
    announcementId?: string;
};

const kindIcons: Record<AnnouncementKind, typeof Megaphone> = {
    advisory: Bell,
    event: CalendarDays,
    volunteer: HandHelping,
};

export default function Show({ announcement, announcementId }: Props) {
    const theme = useResidentTheme();
    const item =
        announcement ??
        findPublishedAnnouncement(announcementId ?? '') ??
        publishedAnnouncements[0];
    const kind = item.kind ?? 'advisory';
    const Icon = kindIcons[kind] ?? Megaphone;
    const kindLabel = item.kind_label ?? 'Advisory';
    const rightAside = (
        <div className="space-y-6">
            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-5 p-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`}>
                        <Radio className="h-5 w-5" />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>Broadcast details</p>
                        <h2 className={`mt-1 text-sm font-black ${theme.textMain}`}>{kindLabel}</h2>
                    </div>
                    <div className={`space-y-4 border-t pt-4 ${theme.dividerColor}`}>
                        <div className="flex items-start gap-3">
                            <CalendarDays className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                            <div className="min-w-0">
                                <p className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>
                                    {item.event_at ? 'Scheduled for' : 'Published'}
                                </p>
                                <p className={`mt-0.5 text-xs font-bold ${theme.textMain}`}>{item.event_at ?? item.published_at}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <UserRound className={`mt-0.5 h-4 w-4 shrink-0 ${theme.primaryText}`} />
                            <div className="min-w-0">
                                <p className={`text-[10px] font-black uppercase tracking-wider ${theme.textMuted}`}>Published by</p>
                                <p className={`mt-0.5 truncate text-xs font-bold ${theme.textMain}`}>{item.author_name}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className={`overflow-hidden rounded-3xl shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                <CardContent className="space-y-3 p-6">
                    <h2 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Stay informed</h2>
                    <p className={`text-xs font-medium leading-relaxed ${theme.textMuted}`}>
                        Browse the latest advisories, community events, and volunteer calls from the barangay.
                    </p>
                    <Link href="/announcements" className={`inline-flex items-center gap-2 pt-1 text-xs font-black ${theme.primaryText} hover:underline`}>
                        <ArrowLeft className="h-3.5 w-3.5" /> All announcements
                    </Link>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <ResidentLayout wide>
            <Head title={item.title} />
            <ResidentSocialShell right={rightAside}>
                <div className="w-full space-y-4 pb-2">
                    <Button variant="ghost" className={`-ml-3 text-xs font-bold ${theme.textMuted} hover:opacity-100 cursor-pointer`} asChild>
                        <Link href="/announcements">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to announcements
                        </Link>
                    </Button>

                    <article className={`w-full overflow-hidden rounded-3xl border shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                        {item.image_url && (
                            <BufferedImage
                                src={item.image_url}
                                alt={item.title}
                                className={`aspect-[16/8] max-h-[32rem] w-full rounded-none border-0 shadow-none`}
                            />
                        )}
                        <div className="space-y-6 p-6 sm:p-9">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                    <Icon className="h-3.5 w-3.5" /> {kindLabel}
                                </span>
                                {item.event_at && (
                                    <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black ${theme.cardBorder} ${theme.accentSurface} ${theme.textMain}`}>
                                        Scheduled · {item.event_at}
                                    </span>
                                )}
                            </div>
                            <header className={`space-y-4 border-b pb-6 ${theme.dividerColor}`}>
                                <h1 className={`break-words text-2xl font-black leading-tight tracking-tight sm:text-4xl ${theme.textMain}`}>{item.title}</h1>
                                <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold ${theme.textMuted}`}>
                                    <span>Published {item.published_at}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>By <strong className={`font-black ${theme.textMain}`}>{item.author_name}</strong></span>
                                </div>
                            </header>
                            <div className={`whitespace-pre-wrap text-sm leading-7 sm:text-base ${theme.textMain}`}>
                                {item.body}
                            </div>
                            {kind === 'volunteer' && (
                                <section className={`space-y-3 rounded-2xl border p-5 sm:p-6 ${theme.badgeBorder} ${theme.accentSurface}`}>
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${theme.primaryText}`}>Community call</p>
                                        <h2 className={`mt-1 text-sm font-black ${theme.textMain}`}>Volunteers requested</h2>
                                    </div>
                                    <VolunteerJoinButton
                                        announcementId={item.id}
                                        hasJoined={item.has_joined}
                                        volunteerCount={item.volunteer_count}
                                    />
                                </section>
                            )}
                        </div>
                    </article>
                </div>
            </ResidentSocialShell>
        </ResidentLayout>
    );
}