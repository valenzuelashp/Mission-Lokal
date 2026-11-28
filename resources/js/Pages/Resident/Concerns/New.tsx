import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ShieldAlert, X } from 'lucide-react';
import { useEffect } from 'react';
import MapPinPicker from '@/Components/maps/MapPinPicker';
import ConcernPhotoPicker from '@/Components/resident/ConcernPhotoPicker';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import ResidentLayout from '@/Layouts/ResidentLayout';
import { TAMBO_BOUNDS, TAMBO_CENTER } from '@/Lib/mapUtils';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

interface Props {
    categories?: { value: string; label: string; description?: string; force_private?: boolean }[];
    emergencyNotice?: string;
    initialConcern?: { id: string; title: string; description: string; category_id: string; visibility: 'public' | 'private'; force_private: boolean; lat: number; lng: number; existing_photo_count?: number };
    mapCenter?: [number, number];
    barangayBounds?: [[number, number], [number, number]];
    modal?: boolean;
    onClose?: () => void;
}

export default function New({ categories = [], emergencyNotice = 'Active emergencies and crimes in progress are outside this system’s scope. Contact 911 immediately, BFP for fires, or PNP for crimes and violent emergencies. Do not wait for a response here.', initialConcern, mapCenter = TAMBO_CENTER, barangayBounds, modal = false, onClose }: Props) {
    const theme = useResidentTheme();
    const { auth } = usePage().props as any;
    const isMinor = auth?.user?.is_minor ?? false;

    const defaultLat = mapCenter && mapCenter[0] ? mapCenter[0] : TAMBO_CENTER[0];
    const defaultLng = mapCenter && mapCenter[1] ? mapCenter[1] : TAMBO_CENTER[1];

    const { data, setData, post, processing, errors, progress, clearErrors } = useForm({
        _method: initialConcern ? 'PUT' : 'POST',
        title: initialConcern?.title ?? '',
        description: initialConcern?.description ?? '',
        category_id: initialConcern?.category_id ?? '',
        visibility: initialConcern?.visibility ?? 'public',
        lat: initialConcern?.lat ?? defaultLat,
        lng: initialConcern?.lng ?? defaultLng,
        images: [] as File[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(initialConcern ? `/concerns/${initialConcern.id}` : '/concerns', {
            forceFormData: data.images.length > 0,
            onSuccess: () => onClose?.(),
        });
    };

    const selectedCategory = categories.find(category => category.value === data.category_id);
    const forcePrivate = Boolean(selectedCategory?.force_private || initialConcern?.force_private);
    useEffect(() => { if (forcePrivate && data.visibility !== 'private') setData('visibility', 'private'); }, [forcePrivate, data.visibility]);

    useEffect(() => {
        if (!modal) return;

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !processing) onClose?.();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [modal, onClose, processing]);

    const pageContent = (
        <>
            <Head title={initialConcern ? 'Edit Concern' : 'Post Concern'} />
            
            <div className={`w-full ${modal ? 'md:flex md:min-h-0 md:flex-1 md:flex-col' : 'space-y-6 pb-2 pt-8 sm:pt-10'}`}>
                {!modal && (
                    <PageHeader
                        title={initialConcern ? 'Edit Your Concern' : 'Post a Community Concern'}
                        description="Pinpoint the exact incident location and provide details. Our AI engine will automatically triage, categorize, and route your report."
                    />
                )}

                <div role="note" className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><strong>For non-emergency concerns only. </strong>{emergencyNotice}</div>
                {isMinor && (
                    <div className={`${modal ? 'mb-2 gap-2 rounded-xl p-2.5 text-[10px]' : 'mb-6 gap-3 rounded-2xl p-5 text-xs'} flex items-start border ${theme.badgeBorder} ${theme.badgeBg} font-bold shadow-2xs`}>
                        <ShieldAlert className={`${modal ? 'h-4 w-4' : 'h-5 w-5'} mt-0.5 shrink-0 ${theme.primaryText}`} />
                        <p className={`leading-relaxed ${theme.textMain}`}>
                            <strong>Minor Account Policy:</strong> You may report public community issues (infrastructure, sanitation), but sensitive or private reports (such as VAWC or noise disputes) are restricted.
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className={modal
                    ? 'grid grid-cols-1 gap-3 md:min-h-0 md:flex-1 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)_auto]'
                    : 'grid gap-6 2xl:grid-cols-2'} noValidate>
                    <Card className={`${modal ? 'flex flex-col' : ''} min-h-0 shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} ${modal ? 'p-3 pb-2 sm:px-4' : 'pb-5'}`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider" id="details-heading">Incident Details</CardTitle>
                        </CardHeader>
                        <CardContent className={modal ? 'grid grid-cols-1 gap-3 p-3 min-[360px]:grid-cols-2 sm:gap-x-4 sm:gap-y-4 sm:p-5 md:min-h-0 md:flex-1 md:content-start md:gap-y-3 md:overflow-y-auto md:p-4' : 'space-y-5 p-6 sm:p-8'} aria-labelledby="details-heading">
                            <div className={modal ? 'col-span-1 min-w-0 space-y-1' : 'space-y-2'}>
                                <Label htmlFor="title">Issue Title <span aria-hidden="true" className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder={modal ? 'e.g. Clogged drain' : 'e.g. Clogged drainage on Mabini St.'}
                                    required
                                    className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                />
                                {errors.title && <p id="title-error" role="alert" className="text-xs font-medium text-destructive">{errors.title}</p>}
                            </div>

                            <div className={modal ? 'col-span-1 min-w-0 space-y-1' : 'space-y-2'}>
                                <Label htmlFor="category_id">{modal ? 'Category' : 'Category Classification'} <span aria-hidden="true" className="text-red-500">*</span></Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className={`flex h-11 w-full rounded-2xl border ${theme.cardBorder} ${theme.inputBg} ${modal ? 'px-2 sm:px-4' : 'px-4'} py-2.5 text-xs font-bold shadow-2xs focus-visible:outline-none focus-visible:ring-2 ${theme.focusRing} cursor-pointer`}
                                    required
                                >
                                    <option value="">{modal ? 'Choose category' : 'Select concern category'}</option>
                                    {categories.map((c) => {
                                        if (isMinor && (c.value === 'vawc' || c.value === 'noise')) {
                                            return null;
                                        }
                                        return (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        );
                                    })}
                                </select>
                                {selectedCategory?.description && <p className={`text-xs leading-relaxed ${theme.textMuted}`}>{selectedCategory.description}</p>}
                                <label className={`mt-3 block text-xs font-bold ${theme.textMain}`}>Visibility
                                    <select aria-label="Concern visibility" value={forcePrivate ? 'private' : data.visibility} disabled={forcePrivate} onChange={event => setData('visibility', event.target.value as 'public' | 'private')} className={`mt-1 w-full rounded-xl border p-2 ${theme.cardBorder} ${theme.inputBg}`}>
                                        <option value="public">Public</option><option value="private">Private</option>
                                    </select>
                                </label>
                                
                                {forcePrivate && (
                                    <div role="alert" aria-live="polite" className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                        <p className="leading-relaxed">{data.category_id === 'vawc' || initialConcern?.category_id === 'vawc' ? 'VAWC reports are kept confidential.' : 'This report contains confidential information.'} Visibility is locked to <strong>Private</strong>; only you and authorized staff can view this report.</p>
                                    </div>
                                )}

                                {errors.category_id && <p id="category-error" role="alert" className="text-xs font-medium text-destructive">{errors.category_id}</p>}
                            </div>

                            <div className={modal ? 'col-span-1 min-w-0 space-y-2 min-[360px]:col-span-2' : 'space-y-2'}>
                                <Label htmlFor="description">Detailed Description <span aria-hidden="true" className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what happened, severity, and when you noticed it..."
                                    required
                                    rows={modal ? 3 : 5}
                                    className={`resize-none ${theme.inputBg} rounded-2xl text-xs ${modal ? 'min-h-24 p-3' : 'p-4'}`}
                                />
                                {errors.description && <p id="description-error" role="alert" className="text-xs font-medium text-destructive">{errors.description}</p>}
                            </div>

                            <div className={modal ? 'col-span-1 min-w-0 space-y-2 min-[360px]:col-span-2' : 'space-y-2'}>
                                <ConcernPhotoPicker files={data.images} existingCount={initialConcern?.existing_photo_count ?? 0} disabled={processing}
                                    error={Object.entries(errors).filter(([field]) => field === 'images' || field.startsWith('images.')).map(([, message]) => message).join(' ')}
                                    onChange={images => {
                                        setData('images', images);
                                        const photoErrors = Object.keys(errors).filter(field => field === 'images' || field.startsWith('images.')) as (keyof typeof data)[];
                                        if (photoErrors.length) clearErrors(...photoErrors);
                                    }} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* LOCATION CARD */}
                    <Card className={`flex min-h-0 flex-col shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} ${modal ? 'p-3 pb-2 sm:px-4' : 'pb-5'}`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider" id="location-heading">Precise Map Location</CardTitle>
                        </CardHeader>
                        <CardContent className={modal ? 'p-3 sm:p-4 md:flex md:min-h-0 md:flex-1 md:flex-col md:p-3' : 'p-6 sm:p-8'} aria-labelledby="location-heading">
                            <div className={modal ? 'md:min-h-0 md:flex-1' : ''}>
                                <MapPinPicker
                                    center={[defaultLat, defaultLng]}
                                    position={[data.lat, data.lng]}
                                    bounds={barangayBounds ?? TAMBO_BOUNDS}
                                    onPositionChange={(lat, lng) => {
                                        setData('lat', lat);
                                        setData('lng', lng);
                                    }}
                                    className={modal ? 'h-56 rounded-2xl overflow-hidden sm:h-64 md:h-full' : 'h-80 sm:h-96 rounded-2xl overflow-hidden'}
                                    compact={modal}
                                />
                            </div>
                            {errors.lat && <p id="location-error" role="alert" className="mt-3 text-xs font-medium text-destructive">{errors.lat}</p>}
                        </CardContent>
                    </Card>

                    {/* SUBMIT SECTION */}
                    <div className={`flex ${modal
                        ? `sticky bottom-0 z-10 -mx-3 flex-row gap-2 border-t ${theme.dividerColor} ${theme.cardBg} p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 md:static md:col-span-2 md:mx-0 md:justify-end md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none`
                        : 'flex-col gap-3 pt-2 sm:flex-row lg:col-span-2'}`}>
                        <Button 
                            type="submit" 
                            className={`${modal ? 'min-w-0 flex-1 px-3 text-xs sm:flex-none sm:px-5' : 'w-full py-3.5 sm:w-auto px-8'} ${theme.primaryBg} ${theme.primaryHover} text-white font-black shadow-sm cursor-pointer rounded-2xl h-11 sm:h-12`}
                            disabled={processing}
                        >
                            {processing
                                ? progress && data.images.length > 0
                                    ? `Uploading photos (${progress.percentage}%)`
                                    : 'Submitting concern...'
                                : initialConcern ? 'Save Changes' : 'Submit Community Concern'}
                        </Button>
                        {modal ? (
                            <Button type="button" variant="outline" className={`font-black text-xs cursor-pointer rounded-2xl h-11 sm:h-12 ${modal ? 'px-5 sm:px-8' : 'w-full py-3.5 sm:w-auto px-8'}`} onClick={onClose} disabled={processing}>
                                Cancel
                            </Button>
                        ) : (
                            <Button type="button" variant="outline" className="w-full sm:w-auto font-black text-xs py-3.5 cursor-pointer rounded-2xl px-8 h-12" asChild>
                                <Link href="/feed">Cancel</Link>
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );

    if (!modal) return <ResidentLayout wide>{pageContent}</ResidentLayout>;

    return (
        <div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-md sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !processing) onClose?.();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-label="Post a Community Concern"
                className={`flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden border shadow-2xl sm:h-[min(94dvh,56rem)] sm:rounded-3xl ${theme.cardBorder} ${theme.cardBg}`}
            >
                <div className={`flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6 ${theme.dividerColor}`}>
                    <p className={`text-xs font-black uppercase tracking-wider ${theme.textMuted}`}>New community concern</p>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        aria-label="Close concern form"
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-2 sm:px-6 sm:py-4 md:overflow-hidden">
                    {pageContent}
                </div>
            </section>
        </div>
    );
}
