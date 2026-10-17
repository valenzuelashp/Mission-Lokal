import { Link, router } from '@inertiajs/react';
import { MapPin, MessageCircle, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import BufferedImage from '@/Components/shared/BufferedImage';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import type { PublicConcern, Severity } from '@/Types';

const severityVariant: Record<Severity, 'success' | 'secondary' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'secondary',
    high: 'warning',
    critical: 'danger',
};

const severityLabel: Record<Severity, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
};

type Props = {
    concern: PublicConcern & { reporter_name?: string };
};

export default function ConcernCard({ concern }: Props) {
    const theme = useResidentTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [privacyEditorOpen, setPrivacyEditorOpen] = useState(false);

    const handleDelete = () => {
        if (confirm('Delete this community concern? This cannot be undone.')) {
            router.delete(`/concerns/${concern.id}`);
        }
    };

    const updateVisibility = (visibility: 'public' | 'private') => {
        router.patch(`/concerns/${concern.id}/visibility`, { visibility });
    };

    return (
        <article className={`overflow-hidden rounded-3xl border ${theme.cardBorder} ${theme.cardBg} shadow-sm transition-all hover:shadow-md w-full`}>
            <div className={`flex items-center justify-between gap-3 p-4 sm:p-5 border-b ${theme.dividerColor}`}>
                <div className="flex min-w-0 items-center gap-3.5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} font-black border shadow-2xs`}>
                        {concern.reporter_name ? concern.reporter_name.charAt(0) : 'ML'}
                    </div>
                    <div className="min-w-0">
                        <p className={`truncate text-sm font-black ${theme.textMain}`}>{concern.reporter_name ?? 'Verified Resident'}</p>
                        <p className={`truncate text-xs font-black uppercase tracking-wider ${theme.primaryText} mt-0.5`}>{concern.category}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <Badge variant={severityVariant[concern.severity]} className="font-black px-3 py-1 rounded-xl">{severityLabel[concern.severity]}</Badge>
                    {concern.is_owner ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                title="Post options"
                                aria-label="Post options"
                                aria-expanded={menuOpen}
                                className={`rounded-2xl p-2.5 ${theme.textMuted} hover:opacity-100 hover:${theme.badgeBg} cursor-pointer transition-colors`}
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                            {menuOpen && (
                                <div className={`absolute right-0 top-12 z-10 w-48 rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-2 text-left shadow-xl space-y-1`}>
                                    {!concern.privacy_locked && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setPrivacyEditorOpen((open) => !open)}
                                                className={`w-full rounded-xl px-3 py-2 text-left text-xs font-bold ${theme.textMain} hover:${theme.badgeBg} cursor-pointer transition-colors`}
                                            >
                                                Edit Privacy
                                            </button>
                                            {privacyEditorOpen && (
                                                <select
                                                    aria-label="Post privacy"
                                                    value={concern.visibility === 'private' ? 'private' : 'public'}
                                                    onChange={(event) => {
                                                        updateVisibility(event.target.value as 'public' | 'private');
                                                        setMenuOpen(false);
                                                        setPrivacyEditorOpen(false);
                                                    }}
                                                    className={`mx-2 mb-2 h-9 w-[calc(100%-1rem)] rounded-xl border ${theme.cardBorder} ${theme.inputBg} px-3 text-xs font-bold cursor-pointer`}
                                                >
                                                    <option value="public">🌐 Everyone</option>
                                                    <option value="private">🔒 Only Me</option>
                                                </select>
                                            )}
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className={`text-xs font-bold ${theme.textMuted} bg-slate-100/70 px-3.5 py-1 rounded-xl border ${theme.cardBorder}`}>
                            Public View
                        </span>
                    )}
                </div>
            </div>

            <div className="px-5 py-5 sm:px-8 space-y-3">
                <Link href={`/concerns/${concern.id}`} className={`block break-words text-lg font-black leading-snug ${theme.textMain} hover:opacity-80 transition-colors sm:text-xl`}>
                    {concern.title}
                </Link>
                
                <div className={`flex flex-col gap-2 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 ${theme.textMuted} font-semibold`}>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 opacity-60" />
                        <span>Posted {concern.created_at}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                        <span className="truncate">{concern.location_label}</span>
                    </div>
                </div>
            </div>

            {concern.images && concern.images.length > 0 && (
                <div className="bg-slate-100/50 overflow-hidden px-5 pb-3">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {concern.images.map((url: string, idx: number) => (
                            <BufferedImage
                                key={idx}
                                src={url}
                                alt="Concern attachment"
                                className={`h-56 w-full sm:h-72 shrink-0 rounded-2xl border ${theme.cardBorder} shadow-2xl object-cover`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className={`flex flex-wrap items-center justify-between gap-4 border-t ${theme.dividerColor} px-6 py-4 ${theme.badgeBg}/20`}>
                <ConcernVoteButtons
                    concernId={concern.id}
                    upvotes={concern.upvotes}
                    downvotes={concern.downvotes}
                    userVote={concern.user_vote ?? null}
                    compact
                />
                
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${theme.cardBg} px-4 py-1.5 rounded-xl border ${theme.cardBorder} shadow-2xs ${theme.textMain}`}>
                        {concern.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className={`border-t ${theme.dividerColor} p-4 ${theme.badgeBg}/10`}>
                <div className={`flex items-center gap-3.5 rounded-2xl ${theme.cardBg} p-3.5 border ${theme.cardBorder} shadow-2xs`}>
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white text-xs font-black shadow-2xs`}>
                        R
                    </div>
                    <Link href={`/concerns/${concern.id}`} className={`flex-1 text-xs font-bold ${theme.textMuted} hover:opacity-100 truncate`}>
                        Write a comment or view discussion details...
                    </Link>
                    <Button variant="ghost" size="icon" asChild className={`h-9 w-9 rounded-xl ${theme.primaryText} hover:opacity-80`}>
                        <Link href={`/concerns/${concern.id}`}>
                            <MessageCircle className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}