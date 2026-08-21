import { Head, Link, useForm } from '@inertiajs/react';
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
import type { NewConcernPageProps } from '@/Types';

// Extend the props to include the boundary array sent from the controller
interface Props extends NewConcernPageProps {
    barangayBounds?: [[number, number], [number, number]];
}

export default function New({ categories = [], mapCenter = [14.6507, 120.9793], barangayBounds }: Props) {
    const defaultLat = mapCenter && mapCenter[0] ? mapCenter[0] : 14.6507;
    const defaultLng = mapCenter && mapCenter[1] ? mapCenter[1] : 120.9793;

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
                title="Post a concern"
                description="Describe the issue and pin it on the map. AI will help route and categorize your report."
            />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2" noValidate>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base" id="details-heading">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4" aria-labelledby="details-heading">
                        {/* TITLE INPUT */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title <span aria-hidden="true" className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Clogged drainage on Mabini St."
                                required
                                aria-required="true"
                                aria-invalid={!!errors.title}
                                aria-describedby={errors.title ? "title-error" : undefined}
                            />
                            {errors.title && <p id="title-error" role="alert" className="text-sm font-medium text-destructive">{errors.title}</p>}
                        </div>

                        {/* CATEGORY SELECT */}
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Category <span aria-hidden="true" className="text-red-500">*</span></Label>
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                                aria-required="true"
                                aria-invalid={!!errors.category_id}
                                aria-describedby={errors.category_id ? "category-error" : undefined}
                            >
                                <option value="">Select a category</option>
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Privacy Alert */}
                            {data.category_id === 'vawc' && (
                                <div role="alert" aria-live="polite" className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                                    <p>For your safety, reports under VAWC / Domestic Dispute are <strong>strictly private</strong>. They will not appear on the public feed and are only visible to authorized barangay personnel.</p>
                                </div>
                            )}

                            {errors.category_id && <p id="category-error" role="alert" className="text-sm font-medium text-destructive">{errors.category_id}</p>}
                        </div>

                        {/* DESCRIPTION TEXTAREA */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description <span aria-hidden="true" className="text-red-500">*</span></Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="What happened? When did you notice it?"
                                required
                                aria-required="true"
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? "description-error" : undefined}
                            />
                            {errors.description && <p id="description-error" role="alert" className="text-sm font-medium text-destructive">{errors.description}</p>}
                        </div>

                        {/* PHOTOS INPUT */}
                        <div className="space-y-2">
                            <Label htmlFor="photos">Photos (optional)</Label>
                            <Input
                                id="photos"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setData('images', Array.from(e.target.files ?? []))}
                                aria-describedby="photos-help"
                            />
                            <span id="photos-help" className="sr-only">You can upload multiple images of the concern to assist barangay personnel.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* LOCATION CARD */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base" id="location-heading">Location</CardTitle>
                    </CardHeader>
                    <CardContent aria-labelledby="location-heading">
                        <div 
                            aria-label="Interactive map to select the location of the concern" 
                            aria-describedby={errors.lat ? "location-error" : undefined}
                        >
                            <MapPinPicker
                                center={[defaultLat, defaultLng]}
                                position={[data.lat, data.lng]}
                                // Pass the bounds data into the map component
                                bounds={barangayBounds}
                                onPositionChange={(lat, lng) => {
                                    setData('lat', lat);
                                    setData('lng', lng);
                                }}
                                className="h-56 sm:h-64 rounded-md"
                            />
                        </div>
                        {errors.lat && <p id="location-error" role="alert" className="mt-2 text-sm font-medium text-destructive">{errors.lat}</p>}
                    </CardContent>
                </Card>

                {/* SUBMIT SECTION */}
                <div className="flex flex-col gap-2 lg:col-span-2 sm:flex-row">
                    <Button 
                        type="submit" 
                        className="w-full sm:w-auto" 
                        disabled={processing}
                        aria-disabled={processing}
                    >
                        {processing ? 'Submitting...' : 'Submit concern'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href="/feed">Cancel</Link>
                    </Button>
                </div>
            </form>
        </ResidentLayout>
    );
}