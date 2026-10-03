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
        <article className={`overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.cardBg} shadow-xs transition-all hover:shadow-md`}>
            <div className={`flex items-center justify-between p-4 pb-3 border-b ${theme.dividerColor}`}>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs">
                        {concern.reporter_name ? concern.reporter_name.charAt(0) : 'ML'}
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${theme.textMain}`}>{concern.reporter_name ?? 'Verified Resident'}</p>
                        <p className={`text-xs font-semibold ${theme.primaryText}`}>{concern.category}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={severityVariant[concern.severity]} className="font-bold">{severityLabel[concern.severity]}</Badge>
                    {concern.is_owner ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                title="Post options"
                                aria-label="Post options"
                                aria-expanded={menuOpen}
                                className={`rounded-full p-2 ${theme.textMuted} hover:opacity-100 hover:bg-slate-100/50 cursor-pointer`}
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </button>
                            {menuOpen && (
                                <div className={`absolute right-0 top-10 z-10 w-44 rounded-xl border ${theme.cardBorder} ${theme.cardBg} p-1.5 text-left shadow-lg`}>
                                    {!concern.privacy_locked && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setPrivacyEditorOpen((open) => !open)}
                                                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-bold ${theme.textMain} hover:bg-slate-50 cursor-pointer`}
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
                                                    className={`mx-2 mb-1 h-8 w-[calc(100%-1rem)] rounded-lg border ${theme.cardBorder} ${theme.inputBg} px-2 text-xs font-bold cursor-pointer`}
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
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className={`text-xs font-semibold opacity-75 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} px-3 py-1 rounded-full border`}>
                            Public View
                        </span>
                    )}
                </div>
            </div>

            <div className="px-5 py-3">
                <Link href={`/concerns/${concern.id}`} className={`block break-words text-base font-bold ${theme.textMain} hover:opacity-80 transition-colors`}>
                    {concern.title}
                </Link>
                
                <div className={`mt-2 flex flex-wrap items-center gap-4 text-xs ${theme.textMuted} font-medium`}>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 opacity-60" />
                        <span>Posted {concern.created_at}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate max-w-[260px]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        <span className="truncate">{concern.location_label}</span>
                    </div>
                </div>
            </div>

            {concern.images && concern.images.length > 0 && (
                <div className="bg-slate-100/50 overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto p-2">
                        {concern.images.map((url: string, idx: number) => (
                            <BufferedImage
                                key={idx}
                                src={url}
                                alt="Concern attachment"
                                className={`h-64 w-full rounded-xl border ${theme.cardBorder} shadow-2xs`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className={`flex items-center justify-between gap-2 border-t ${theme.dividerColor} px-5 py-3 bg-slate-50/30`}>
                <ConcernVoteButtons
                    concernId={concern.id}
                    upvotes={concern.upvotes}
                    downvotes={concern.downvotes}
                    userVote={concern.user_vote ?? null}
                    compact
                />
                
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold capitalize ${theme.cardBg} px-3 py-1 rounded-full border ${theme.cardBorder} shadow-2xs ${theme.textMain}`}>
                        {concern.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className={`border-t ${theme.dividerColor} p-2.5 bg-slate-50/50`}>
                <div className={`flex items-center gap-3 rounded-xl ${theme.cardBg} p-3 border ${theme.cardBorder} shadow-2xs`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${theme.primaryBg} text-white text-xs font-bold`}>
                        R
                    </div>
                    <Link href={`/concerns/${concern.id}`} className={`flex-1 text-xs font-medium ${theme.textMuted} hover:opacity-100 truncate`}>
                        Write a comment or view discussion details...
                    </Link>
                    <Button variant="ghost" size="icon" asChild className={`h-8 w-8 ${theme.primaryText} hover:bg-blue-50`}>
                        <Link href={`/concerns/${concern.id}`}>
                            <MessageCircle className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}