import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ShieldAlert } from 'lucide-react';
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
import type { NewConcernPageProps } from '@/Types';

interface Props extends NewConcernPageProps {
    barangayBounds?: [[number, number], [number, number]];
}

export default function New({ categories = [], mapCenter = TAMBO_CENTER, barangayBounds }: Props) {
    const theme = useResidentTheme();
    const { auth } = usePage().props as any;
    const isMinor = auth?.user?.is_minor ?? false;

    const defaultLat = mapCenter && mapCenter[0] ? mapCenter[0] : TAMBO_CENTER[0];
    const defaultLng = mapCenter && mapCenter[1] ? mapCenter[1] : TAMBO_CENTER[1];

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '',
        lat: defaultLat,
        lng: defaultLng,
        images: [] as File[],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/concerns', { forceFormData: true });
    };

    return (
        <ResidentLayout>
            <Head title="Post Concern" />
            <PageHeader
                title="Post a Community Concern"
                description="Pinpoint the exact incident location and provide details. Our AI engine will automatically triage, categorize, and route your report."
            />

            {isMinor && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-bold text-blue-900 shadow-2xs">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <p className="leading-relaxed">
                        <strong>Minor Account Policy:</strong> You may report public community issues (infrastructure, sanitation), but sensitive or private reports (such as VAWC or noise disputes) are restricted.
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2" noValidate>
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardHeader className={`border-b ${theme.dividerColor} pb-4`}>
                        <CardTitle className="text-sm font-black uppercase tracking-wider" id="details-heading">Incident Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4" aria-labelledby="details-heading">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Issue Title <span aria-hidden="true" className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Clogged drainage on Mabini St."
                                required
                                className={theme.inputBg}
                            />
                            {errors.title && <p id="title-error" role="alert" className="text-xs font-medium text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="category_id">Category Classification <span aria-hidden="true" className="text-red-500">*</span></Label>
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className={`flex h-10 w-full rounded-xl border ${theme.cardBorder} ${theme.inputBg} px-3.5 py-2 text-xs font-semibold shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer`}
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
                                <div role="alert" aria-live="polite" className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-bold text-amber-900">
                                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                    <p className="leading-relaxed">VAWC / Domestic reports are <strong>strictly confidential</strong> and forced private. They will never appear on the public community feed.</p>
                                </div>
                            )}

                            {errors.category_id && <p id="category-error" role="alert" className="text-xs font-medium text-destructive">{errors.category_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Detailed Description <span aria-hidden="true" className="text-red-500">*</span></Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe what happened, severity, and when you noticed it..."
                                required
                                rows={5}
                                className={`resize-none ${theme.inputBg}`}
                            />
                            {errors.description && <p id="description-error" role="alert" className="text-xs font-medium text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="photos">Photographic Evidence (Optional)</Label>
                            <Input
                                id="photos"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setData('images', Array.from(e.target.files ?? []))}
                                className={`${theme.inputBg} file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 cursor-pointer`}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* LOCATION CARD */}
                <Card className={`shadow-xs ${theme.cardBorder} ${theme.cardBg} rounded-2xl`}>
                    <CardHeader className={`border-b ${theme.dividerColor} pb-4`}>
                        <CardTitle className="text-sm font-black uppercase tracking-wider" id="location-heading">Precise Map Location</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4" aria-labelledby="location-heading">
                        <div>
                            <MapPinPicker
                                center={[defaultLat, defaultLng]}
                                position={[data.lat, data.lng]}
                                bounds={barangayBounds ?? TAMBO_BOUNDS}
                                onPositionChange={(lat, lng) => {
                                    setData('lat', lat);
                                    setData('lng', lng);
                                }}
                                className="h-64 sm:h-72 rounded-xl overflow-hidden"
                            />
                        </div>
                        {errors.lat && <p id="location-error" role="alert" className="mt-2 text-xs font-medium text-destructive">{errors.lat}</p>}
                    </CardContent>
                </Card>

                {/* SUBMIT SECTION */}
                <div className="flex flex-col gap-2.5 lg:col-span-2 sm:flex-row pt-2">
                    <Button 
                        type="submit" 
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer" 
                        disabled={processing}
                    >
                        {processing ? 'Analyzing & Submitting...' : 'Submit Community Concern'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto font-bold text-xs py-3 cursor-pointer" asChild>
                        <Link href="/feed">Cancel</Link>
                    </Button>
                </div>
            </form>
        </ResidentLayout>
    );
}