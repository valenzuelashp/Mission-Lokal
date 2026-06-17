import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import MapPinPicker from '@/Components/maps/MapPinPicker';
import PageHeader from '@/Components/shared/PageHeader';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import ResidentLayout from '@/Layouts/ResidentLayout';
import type { NewConcernPageProps } from '@/Types';

export default function New({ categories, mapCenter }: NewConcernPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: '',
        lat: mapCenter[0],
        lng: mapCenter[1],
        photos: [] as File[],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/concerns');
    };

    return (
        <ResidentLayout>
            <Head title="Post Concern" />
            <PageHeader
                title="Post a concern"
                description="Describe the issue and pin it on the map. AI will help route and categorize your report."
            />

            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Clogged drainage on Mabini St."
                            />
                            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Select a category</option>
                                {categories.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="What happened? When did you notice it?"
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photos">Photos (optional)</Label>
                            <Input
                                id="photos"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setData('photos', Array.from(e.target.files ?? []))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MapPinPicker
                            center={mapCenter}
                            position={[data.lat, data.lng]}
                            onPositionChange={(lat, lng) => {
                                setData('lat', lat);
                                setData('lng', lng);
                            }}
                            className="h-56 sm:h-64"
                        />
                        {errors.lat && <p className="mt-2 text-sm text-destructive">{errors.lat}</p>}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-2 lg:col-span-2 sm:flex-row">
                    <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                        Submit concern
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href="/feed">Cancel</Link>
                    </Button>
                </div>
            </form>
        </ResidentLayout>
    );
}
