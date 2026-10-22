import { Link, router } from '@inertiajs/react';
import { MapPin, MessageCircle, Calendar, MoreHorizontal, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import MapView from '@/Components/maps/MapView';
import BufferedImage from '@/Components/shared/BufferedImage';
import ConcernVoteButtons from '@/Components/resident/ConcernVoteButtons';
import { Badge } from '@/Components/ui/badge';
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
    const [mapOpen, setMapOpen] = useState(false);
    const hasMap = concern.lat != null && concern.lng != null;

    useEffect(() => {
        if (!mapOpen) {
            return;
        }

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMapOpen(false);
            }
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [mapOpen]);

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
                        {hasMap && (
                            <button
                                type="button"
                                onClick={() => setMapOpen(true)}
                                className={`shrink-0 rounded-xl border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${theme.cardBorder} ${theme.badgeBg} ${theme.primaryText} cursor-pointer`}
                            >
                                View map
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {mapOpen && hasMap && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
                    onClick={() => setMapOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Map for ${concern.title}`}
                        className={`w-full max-w-lg space-y-3 rounded-3xl border p-4 shadow-2xl ${theme.cardBorder} ${theme.cardBg}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className={`min-w-0 truncate text-sm font-black ${theme.textMain}`}>{concern.location_label}</p>
                            <button
                                type="button"
                                onClick={() => setMapOpen(false)}
                                aria-label="Close map"
                                className={`rounded-xl p-2 ${theme.textMuted} hover:${theme.badgeBg} cursor-pointer`}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <MapView
                            center={[concern.lat as number, concern.lng as number]}
                            zoom={16}
                            pins={[{
                                id: concern.id,
                                lat: concern.lat as number,
                                lng: concern.lng as number,
                                title: concern.title,
                                severity: concern.severity,
                            }]}
                            className="h-72"
                        />
                    </div>
                </div>
            )}

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

            {concern.latest_update && (
            <div className={`border-t ${theme.dividerColor} p-4 ${theme.badgeBg}/10`}>
                <Link
                    href={`/concerns/${concern.id}`}
                    className={`flex items-start gap-3.5 rounded-2xl ${theme.cardBg} p-3.5 border ${theme.cardBorder} shadow-2xs`}
                >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${theme.primaryBg} text-white text-xs font-black shadow-2xs`}>
                        B
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className={`text-[10px] font-black uppercase tracking-wider ${theme.primaryText}`}>
                            Barangay update
                            {` · ${concern.latest_update.label}`}
                            {concern.latest_update.at ? ` · ${concern.latest_update.at}` : ''}
                        </p>
                        <p className={`mt-1 text-xs font-semibold leading-relaxed ${theme.textMain}`}>
                            {concern.latest_update.message}
                        </p>
                        {concern.latest_update?.prescriptive_steps && concern.latest_update.prescriptive_steps.length > 0 && (
                            <div className="mt-2">
                                <p className={`text-[11px] font-black ${theme.textMain}`}>AI-suggested next steps</p>
                                <ol className={`mt-1 list-decimal space-y-1 pl-4 text-[11px] font-medium leading-relaxed ${theme.textMuted}`}>
                                    {concern.latest_update.prescriptive_steps.map((step, index) => (
                                        <li key={`${index}-${step}`}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        {(concern.latest_update?.estimated_duration || concern.latest_update?.estimated_completion) && (
                            <p className={`mt-2 text-[11px] font-semibold ${theme.textMuted}`}>
                                {concern.latest_update.estimated_duration && `Estimated duration: ${concern.latest_update.estimated_duration}`}
                                {concern.latest_update.estimated_duration && concern.latest_update.estimated_completion && ' · '}
                                {concern.latest_update.estimated_completion && `Target completion: ${concern.latest_update.estimated_completion}`}
                                <span className="block">Estimate only; actual timing may vary.</span>
                            </p>
                        )}
                        <span className={`mt-1.5 inline-block text-[11px] font-bold ${theme.textMuted}`}>
                            View all updates
                        </span>
                    </div>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.primaryText}`}>
                        <MessageCircle className="h-4 w-4" />
                    </span>
                </Link>
            </div>
            )}
        </article>
    );
}