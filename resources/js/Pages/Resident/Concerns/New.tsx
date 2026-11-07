import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ShieldAlert, X } from 'lucide-react';
import { useEffect } from 'react';
import MapPinPicker from '@/Components/maps/MapPinPicker';
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
    categories?: { value: string; label: string }[];
    mapCenter?: [number, number];
    barangayBounds?: [[number, number], [number, number]];
    modal?: boolean;
    onClose?: () => void;
}

export default function New({ categories = [], mapCenter = TAMBO_CENTER, barangayBounds, modal = false, onClose }: Props) {
    const theme = useResidentTheme();
    const { auth } = usePage().props as any;
    const isMinor = auth?.user?.is_minor ?? false;

    const defaultLat = mapCenter && mapCenter[0] ? mapCenter[0] : TAMBO_CENTER[0];
    const defaultLng = mapCenter && mapCenter[1] ? mapCenter[1] : TAMBO_CENTER[1];

    const { data, setData, post, processing, errors, progress } = useForm({
        title: '',
        description: '',
        category_id: '',
        lat: defaultLat,
        lng: defaultLng,
        images: [] as File[],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/concerns', {
            forceFormData: data.images.length > 0,
            onSuccess: () => onClose?.(),
        });
    };

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
            <Head title="Post Concern" />
            
            <div className={`w-full ${modal ? 'flex min-h-0 flex-1 flex-col' : 'space-y-6 pb-2 pt-8 sm:pt-10'}`}>
                {!modal && (
                    <PageHeader
                        title="Post a Community Concern"
                        description="Pinpoint the exact incident location and provide details. Our AI engine will automatically triage, categorize, and route your report."
                    />
                )}

                {isMinor && (
                    <div className={`${modal ? 'mb-2 gap-2 rounded-xl p-2.5 text-[10px]' : 'mb-6 gap-3 rounded-2xl p-5 text-xs'} flex items-start border ${theme.badgeBorder} ${theme.badgeBg} font-bold shadow-2xs`}>
                        <ShieldAlert className={`${modal ? 'h-4 w-4' : 'h-5 w-5'} mt-0.5 shrink-0 ${theme.primaryText}`} />
                        <p className={`leading-relaxed ${theme.textMain}`}>
                            <strong>Minor Account Policy:</strong> You may report public community issues (infrastructure, sanitation), but sensitive or private reports (such as VAWC or noise disputes) are restricted.
                        </p>
                    </div>
                )}

                <form onSubmit={submit} className={modal
                    ? 'grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)_auto]'
                    : 'grid gap-6 2xl:grid-cols-2'} noValidate>
                    <Card className={`min-h-0 shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} ${modal ? 'p-3 pb-2 sm:px-4' : 'pb-5'}`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider" id="details-heading">Incident Details</CardTitle>
                        </CardHeader>
                        <CardContent className={modal ? 'grid grid-cols-2 gap-x-3 gap-y-2 p-3 sm:p-4' : 'space-y-5 p-6 sm:p-8'} aria-labelledby="details-heading">
                            <div className={modal ? 'col-span-1 min-w-0 space-y-1' : 'space-y-2'}>
                                <Label htmlFor="title">Issue Title <span aria-hidden="true" className="text-red-500">*</span></Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Clogged drainage on Mabini St."
                                    required
                                    className={`${theme.inputBg} rounded-2xl h-11 text-xs`}
                                />
                                {errors.title && <p id="title-error" role="alert" className="text-xs font-medium text-destructive">{errors.title}</p>}
                            </div>

                            <div className={modal ? 'col-span-1 min-w-0 space-y-1' : 'space-y-2'}>
                                <Label htmlFor="category_id">Category Classification <span aria-hidden="true" className="text-red-500">*</span></Label>
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className={`flex h-11 w-full rounded-2xl border ${theme.cardBorder} ${theme.inputBg} px-4 py-2.5 text-xs font-bold shadow-2xs focus-visible:outline-none focus-visible:ring-2 ${theme.focusRing} cursor-pointer`}
                                    required
                                >
                                    <option value="">Select concern category</option>
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
                                
                                {data.category_id === 'vawc' && (
                                    <div role="alert" aria-live="polite" className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
                                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                        <p className="leading-relaxed">VAWC / Domestic reports are <strong>strictly confidential</strong> and forced private. They will never appear on the public community feed.</p>
                                    </div>
                                )}

                                {errors.category_id && <p id="category-error" role="alert" className="text-xs font-medium text-destructive">{errors.category_id}</p>}
                            </div>

                            <div className={modal ? 'col-span-2 min-w-0 space-y-1' : 'space-y-2'}>
                                <Label htmlFor="description">Detailed Description <span aria-hidden="true" className="text-red-500">*</span></Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what happened, severity, and when you noticed it..."
                                    required
                                    rows={modal ? 3 : 5}
                                    className={`resize-none ${theme.inputBg} rounded-2xl p-4 text-xs`}
                                />
                                {errors.description && <p id="description-error" role="alert" className="text-xs font-medium text-destructive">{errors.description}</p>}
                            </div>

                            <div className={modal ? 'col-span-2 min-w-0 space-y-1' : 'space-y-2'}>
                                <Label htmlFor="photos">Photographic Evidence (Optional)</Label>
                                <Input
                                    id="photos"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setData('images', Array.from(e.target.files ?? []))}
                                    className={`${theme.inputBg} rounded-2xl h-11 text-xs file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-transparent file:text-current cursor-pointer`}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* LOCATION CARD */}
                    <Card className={`flex min-h-0 flex-col shadow-2xs ${theme.cardBorder} ${theme.cardBg} rounded-3xl overflow-hidden`}>
                        <CardHeader className={`border-b ${theme.dividerColor} ${modal ? 'p-3 pb-2 sm:px-4' : 'pb-5'}`}>
                            <CardTitle className="text-sm font-black uppercase tracking-wider" id="location-heading">Precise Map Location</CardTitle>
                        </CardHeader>
                        <CardContent className={modal ? 'flex min-h-0 flex-1 flex-col p-2 sm:p-3' : 'p-6 sm:p-8'} aria-labelledby="location-heading">
                            <div className={modal ? 'min-h-0 flex-1' : ''}>
                                <MapPinPicker
                                    center={[defaultLat, defaultLng]}
                                    position={[data.lat, data.lng]}
                                    bounds={barangayBounds ?? TAMBO_BOUNDS}
                                    onPositionChange={(lat, lng) => {
                                        setData('lat', lat);
                                        setData('lng', lng);
                                    }}
                                    className={modal ? 'h-[clamp(7rem,18dvh,10rem)] sm:h-40 md:h-full rounded-2xl overflow-hidden' : 'h-80 sm:h-96 rounded-2xl overflow-hidden'}
                                    compact={modal}
                                />
                            </div>
                            {errors.lat && <p id="location-error" role="alert" className="mt-3 text-xs font-medium text-destructive">{errors.lat}</p>}
                        </CardContent>
                    </Card>

                    {/* SUBMIT SECTION */}
                    <div className={`flex ${modal ? 'flex-row gap-2 pt-0 md:col-span-2 md:justify-end' : 'flex-col gap-3 pt-2 sm:flex-row lg:col-span-2'}`}>
                        <Button 
                            type="submit" 
                            className={`${modal ? 'min-w-0 flex-1 px-2 text-[10px] sm:flex-none sm:px-5 sm:text-xs' : 'w-full py-3.5 sm:w-auto px-8'} ${theme.primaryBg} ${theme.primaryHover} text-white font-black shadow-sm cursor-pointer rounded-2xl h-10 sm:h-12`}
                            disabled={processing}
                        >
                            {processing
                                ? progress && data.images.length > 0
                                    ? `Uploading photos (${progress.percentage}%)`
                                    : 'Submitting concern...'
                                : 'Submit Community Concern'}
                        </Button>
                        {modal ? (
                            <Button type="button" variant="outline" className={`font-black text-xs cursor-pointer rounded-2xl h-10 sm:h-12 ${modal ? 'px-4 sm:px-8' : 'w-full py-3.5 sm:w-auto px-8'}`} onClick={onClose} disabled={processing}>
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
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2 sm:px-6 sm:py-4">
                    {pageContent}
                </div>
            </section>
        </div>
    );
}