import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Images, Plus, X } from 'lucide-react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type Props = {
    images?: string[] | null;
    title: string;
};

export default function ConcernPhotoGallery({ images, title }: Props) {
    const theme = useResidentTheme();
    const photoUrls = images ?? [];
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
    const previewImages = photoUrls.slice(0, 3);

    useEffect(() => {
        if (!galleryOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (zoomedIndex !== null) {
                    setZoomedIndex(null);
                } else {
                    setGalleryOpen(false);
                }
            }
            if (zoomedIndex !== null && event.key === 'ArrowLeft') {
                setZoomedIndex((index) => index === null ? null : (index - 1 + photoUrls.length) % photoUrls.length);
            }
            if (zoomedIndex !== null && event.key === 'ArrowRight') {
                setZoomedIndex((index) => index === null ? null : (index + 1) % photoUrls.length);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [galleryOpen, photoUrls.length, zoomedIndex]);

    if (photoUrls.length === 0) return null;

    const openGallery = (index = 0) => {
        setZoomedIndex(index);
        setGalleryOpen(true);
    };

    const changePhoto = (direction: -1 | 1) => {
        setZoomedIndex((index) => index === null ? null : (index + direction + photoUrls.length) % photoUrls.length);
    };

    const gridColumns = previewImages.length === 1
        ? 'grid-cols-1'
        : previewImages.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-2 sm:grid-cols-3';

    return (
        <>
            <div className={`grid gap-2.5 ${gridColumns}`}>
                {previewImages.map((image, index) => {
                    const remaining = photoUrls.length - previewImages.length;
                    const isLastPreview = index === previewImages.length - 1;

                    return (
                        <button
                            key={`${image}-${index}`}
                            type="button"
                            onClick={() => openGallery(index)}
                            aria-label={isLastPreview && remaining > 0
                                ? `Open photo gallery, ${photoUrls.length} photos, ${remaining} more`
                                : `View photo ${index + 1} of ${photoUrls.length}`}
                            className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.inputBg} focus-visible:outline-none focus-visible:ring-2 ${theme.focusRing}`}
                        >
                            <img
                                src={image}
                                alt={`${title}, photo ${index + 1}`}
                                loading="lazy"
                                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                            />
                            {isLastPreview && remaining > 0 && (
                                <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-950/65 text-base font-black text-white">
                                    <Plus className="h-5 w-5" />{remaining}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {galleryOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6"
                    onClick={() => setGalleryOpen(false)}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Photos for ${title}`}
                        className={`flex h-full max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${theme.cardBorder} ${theme.cardBg}`}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <header className={`flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4 ${theme.dividerColor}`}>
                            {zoomedIndex === null ? (
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <Images className={`h-4 w-4 shrink-0 ${theme.primaryText}`} />
                                    <h2 className={`truncate text-sm font-black ${theme.textMain}`}>Photos · {photoUrls.length}</h2>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setZoomedIndex(null)}
                                    className={`text-xs font-black ${theme.primaryText} hover:underline`}
                                >
                                    All photos
                                </button>
                            )}
                            <div className="flex shrink-0 items-center gap-2">
                                {zoomedIndex !== null && (
                                    <span className={`text-[11px] font-bold ${theme.textMuted}`}>
                                        {zoomedIndex + 1} / {photoUrls.length}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => { setGalleryOpen(false); setZoomedIndex(null); }}
                                    aria-label="Close photo gallery"
                                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </header>

                        {zoomedIndex === null ? (
                            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {photoUrls.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setZoomedIndex(index)}
                                            aria-label={`Zoom photo ${index + 1}`}
                                            className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.inputBg} focus-visible:outline-none focus-visible:ring-2 ${theme.focusRing}`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${title}, photo ${index + 1}`}
                                                loading="lazy"
                                                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                                            />
                                            <span className={`absolute bottom-2 right-2 rounded-lg px-2 py-1 text-[10px] font-black ${theme.cardBg} ${theme.textMain}`}>
                                                {index + 1}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-0 flex-1 items-center gap-1 p-2 sm:gap-3 sm:p-4">
                                <button
                                    type="button"
                                    onClick={() => changePhoto(-1)}
                                    aria-label="Previous photo"
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-slate-950/5 p-2 sm:p-4">
                                    <img
                                        src={photoUrls[zoomedIndex]}
                                        alt={`${title}, photo ${zoomedIndex + 1}`}
                                        className="h-auto w-auto max-h-full max-w-full object-contain"
                                        style={{
                                            maxHeight: 'calc(100dvh - 12rem)',
                                            maxWidth: 'calc(100vw - 7rem)',
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => changePhoto(1)}
                                    aria-label="Next photo"
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                    </section>
                </div>
            )}
        </>
    );
}