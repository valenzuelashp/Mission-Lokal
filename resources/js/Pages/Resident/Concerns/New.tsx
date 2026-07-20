import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
        <ResidentLayout wide>
            <Head title="Post Concern" />
            
            {/* Background Canvas Layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#fbfbfa]">
                <div className="absolute top-0 right-0 w-[50rem] h-[50rem] rounded-full bg-gradient-to-b from-neutral-200/30 to-transparent blur-[140px] opacity-60" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 py-2 space-y-4">
                <Button variant="ghost" className="h-8 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 px-2 -ml-1" asChild>
                    <Link href="/feed">
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Feed
                    </Link>
                </Button>

                <div className="border border-neutral-200/60 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm">
                    <PageHeader
                        title="Post a concern"
                        description="Describe the operational issue and pin it securely on the local block layout map. AI pipeline processes classification."
                    />
                </div>

                <form onSubmit={submit} className="grid gap-4 grid-cols-1 lg:grid-cols-5 text-xs font-bold text-neutral-700 items-start">
                    {/* Left Form Input Parameters */}
                    <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden lg:col-span-3">
                        <CardHeader className="border-b border-neutral-100/70 px-4 py-3">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-950">Report Parameters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-[11px] uppercase tracking-wider text-neutral-500">Concern Title</Label>
                                <Input
                                    id="title"
                                    className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Broken street light on Rizal St."
                                />
                                {errors.title && <p className="text-[11px] font-medium text-red-600 mt-1">{errors.title}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-[11px] uppercase tracking-wider text-neutral-500">Category Scope</Label>
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="flex h-9 w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-1.5 font-medium text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 text-xs"
                                >
                                    <option value="">Select an initial category</option>
                                    {categories.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-[11px] font-medium text-red-600 mt-1">{errors.category}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-[11px] uppercase tracking-wider text-neutral-500">Detailed Description</Label>
                                <Textarea
                                    id="description"
                                    className="rounded-xl bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-400 text-neutral-900 font-medium leading-relaxed"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the issue context clearly. When did you notice it occur?"
                                    rows={4}
                                />
                                {errors.description && <p className="text-[11px] font-medium text-red-600 mt-1">{errors.description}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="photos" className="text-[11px] uppercase tracking-wider text-neutral-500">Attachment Photos (Optional)</Label>
                                <Input
                                    id="photos"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="h-9 rounded-xl bg-neutral-50/50 border-neutral-200 file:border-0 file:bg-neutral-900 file:text-white file:text-xs file:font-bold file:h-full file:mr-3 rounded-xl pr-3"
                                    onChange={(e) => setData('photos', Array.from(e.target.files ?? []))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Mapping Component */}
                    <div className="lg:col-span-2 space-y-4 w-full">
                        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-4 space-y-2">
                            <Label className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block px-0.5">Geotag Coordinates</Label>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/70">
                                <MapPinPicker
                                    center={mapCenter}
                                    position={[data.lat, data.lng]}
                                    onPositionChange={(lat, lng) => {
                                        setData('lat', lat);
                                        setData('lng', lng);
                                    }}
                                    className="h-48 sm:h-56"
                                />
                            </div>
                            {errors.lat && <p className="text-[11px] font-medium text-red-600 px-0.5 mt-1">{errors.lat}</p>}
                        </Card>

                        <div className="flex flex-col gap-2 sm:flex-row w-full">
                            <Button type="submit" className="h-9 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-bold px-4 shadow-sm w-full" disabled={processing}>
                                Submit Concern
</Button>
                            <Button type="button" variant="outline" className="h-9 rounded-xl border-neutral-200 text-neutral-700 text-xs font-bold px-4 w-full bg-white" asChild>
                                <Link href="/feed">Cancel</Link>
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </ResidentLayout>
    );
}