import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, LockKeyhole, MapPin, Phone, Radio, UserRound } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import MapPinPicker from '@/Components/maps/MapPinPicker';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { TAMBO_BOUNDS, TAMBO_CENTER } from '@/Lib/mapUtils';
import FormProgress from '@/Components/shared/FormProgress';

interface IntakeSubcategory {
    id: number;
    code: string;
    name: string;
    force_private: boolean;
}

interface IntakeCategory {
    id: number;
    code: string;
    name: string;
    subcategories: IntakeSubcategory[];
}

interface Props {
    categories: IntakeCategory[];
    mapCenter?: [number, number];
    barangayBounds?: [[number, number], [number, number]];
}

export default function Intake({ categories = [], mapCenter = TAMBO_CENTER, barangayBounds = TAMBO_BOUNDS }: Props) {
    const [step, setStep] = useState(1);
    const [defaultLat, defaultLng] = mapCenter;
    const { data, setData, post, processing, errors } = useForm({
        intake_channel: 'phone',
        intake_reporter_name: '',
        intake_reporter_phone: '',
        intake_reporter_address: '',
        title: '',
        description: '',
        incident_occurred_at: '',
        category_id: '',
        subcategory_id: '',
        incident_location: '',
        lat: defaultLat,
        lng: defaultLng,
        visibility: 'public',
        images: [] as File[],
    });

    const selectedCategory = categories.find((category) => String(category.id) === data.category_id);
    const subcategories = selectedCategory?.subcategories ?? [];
    const selectedSubcategory = subcategories.find((subcategory) => String(subcategory.id) === data.subcategory_id);
    const forcedPrivate = selectedSubcategory?.force_private || selectedSubcategory?.code === 'VAWC';

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        post('/admin/reports/intake', { forceFormData: true });
    };

    return (
        <AdminLayout title="Log Phone or Walk-in Concern">
            <Head title="Log a Desk Concern" />
            <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900">Log a Desk Concern</h1>
                        <p className="text-sm text-slate-600">Record a concern received by phone or at the barangay desk. No resident account is created.</p>
                    </div>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to reports</Link>
                    </Button>
                </div>

                <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <FormProgress current={step} total={2} labels={['Reporter & concern', 'Location & privacy']} />
                    </div>
                    {step === 1 && <section className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-700"><UserRound className="h-4 w-4" />Caller / Walk-in</h2>
                            <div className="space-y-2">
                                <Label>Received via</Label>
                                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Concern intake source">
                                    <button type="button" onClick={() => setData('intake_channel', 'phone')} className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-bold ${data.intake_channel === 'phone' ? 'border-cyan-700 bg-cyan-50 text-cyan-900' : 'border-slate-200 text-slate-600'}`}>
                                        <Phone className="h-4 w-4" /> Phone call
                                    </button>
                                    <button type="button" onClick={() => setData('intake_channel', 'walk_in')} className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-bold ${data.intake_channel === 'walk_in' ? 'border-cyan-700 bg-cyan-50 text-cyan-900' : 'border-slate-200 text-slate-600'}`}>
                                        <Radio className="h-4 w-4" /> Walk-in
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caller-name">Resident name</Label>
                                <Input id="caller-name" placeholder="e.g. Juan Dela Cruz" value={data.intake_reporter_name} onChange={(event) => setData('intake_reporter_name', event.target.value)} autoComplete="off" required maxLength={255} />
                                {errors.intake_reporter_name && <p role="alert" className="text-xs text-red-700">{errors.intake_reporter_name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caller-phone">Phone number</Label>
                                <Input id="caller-phone" type="tel" inputMode="tel" placeholder="09XX XXX XXXX" value={data.intake_reporter_phone} onChange={(event) => setData('intake_reporter_phone', event.target.value)} autoComplete="off" maxLength={40} />
                                {errors.intake_reporter_phone && <p role="alert" className="text-xs text-red-700">{errors.intake_reporter_phone}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="caller-address">Resident address or callback details</Label>
                                <Textarea id="caller-address" placeholder="House number, street, and callback details" value={data.intake_reporter_address} onChange={(event) => setData('intake_reporter_address', event.target.value)} autoComplete="off" rows={2} maxLength={512} />
                                {errors.intake_reporter_address && <p role="alert" className="text-xs text-red-700">{errors.intake_reporter_address}</p>}
                            </div>
                            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                                Caller details are kept as restricted intake information. They are not used as a resident login or shown on the public concern feed.
                            </p>
                        </div>

                        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <h2 className="text-sm font-black uppercase text-slate-700">Concern details</h2>
                            <div className="space-y-2">
                                <Label htmlFor="concern-title">Concern title</Label>
                                <Input id="concern-title" placeholder="Briefly summarize the concern" value={data.title} onChange={(event) => setData('title', event.target.value)} required maxLength={255} />
                                {errors.title && <p role="alert" className="text-xs text-red-700">{errors.title}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select id="category" value={data.category_id} onChange={(event) => setData({ ...data, category_id: event.target.value, subcategory_id: '' })} required className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                                    <option value="">Select category</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                                {errors.category_id && <p role="alert" className="text-xs text-red-700">{errors.category_id}</p>}
                            </div>
                            {subcategories.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="subcategory">Subcategory</Label>
                                    <select id="subcategory" value={data.subcategory_id} onChange={(event) => setData('subcategory_id', event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                                        <option value="">Select subcategory (optional)</option>
                                        {subcategories.map((subcategory) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="description">What happened?</Label>
                                <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} required minLength={10} maxLength={10000} rows={5} placeholder="Record the resident's description, when it happened, and any immediate safety concerns." />
                                {errors.description && <p role="alert" className="text-xs text-red-700">{errors.description}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="incident-occurred-at">When did it happen or get noticed? (optional)</Label>
                                <Input id="incident-occurred-at" type="datetime-local" value={data.incident_occurred_at} onChange={(event) => setData('incident_occurred_at', event.target.value)} />
                                {errors.incident_occurred_at && <p role="alert" className="text-xs text-red-700">{errors.incident_occurred_at}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="evidence">Photos (optional, up to 5)</Label>
                                <Input id="evidence" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setData('images', Array.from(event.target.files ?? []).slice(0, 5))} />
                                {errors.images && <p role="alert" className="text-xs text-red-700">{errors.images}</p>}
                            </div>
                        </div>
                    </section>}

                    {step === 2 && <section className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-700"><MapPin className="h-4 w-4" />Incident location</h2>
                            <div className="space-y-2">
                                <Label htmlFor="incident-location">Address, landmark, or location description</Label>
                                <Input id="incident-location" value={data.incident_location} onChange={(event) => setData('incident_location', event.target.value)} required maxLength={512} />
                                {errors.incident_location && <p role="alert" className="text-xs text-red-700">{errors.incident_location}</p>}
                            </div>
                            <MapPinPicker
                                center={mapCenter}
                                position={[data.lat, data.lng]}
                                bounds={barangayBounds}
                                onPositionChange={(lat, lng) => setData({ ...data, lat, lng })}
                                className="h-72"
                            />
                            {(errors.lat || errors.lng) && <p role="alert" className="text-xs text-red-700">Select a valid location inside the barangay boundary.</p>}
                        </div>

                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                            <h2 className="flex items-center gap-2 text-sm font-black uppercase text-slate-700"><LockKeyhole className="h-4 w-4" />Privacy and evidence</h2>
                            <fieldset className="space-y-3">
                                <legend className="text-sm font-semibold text-slate-800">Feed visibility</legend>
                                <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                                    <input type="radio" name="visibility" value="public" checked={data.visibility === 'public' && !forcedPrivate} disabled={Boolean(forcedPrivate)} onChange={() => setData('visibility', 'public')} />
                                    <span><strong className="block text-sm">Public community concern</strong><span className="text-xs text-slate-600">May appear in the public feed after triage.</span></span>
                                </label>
                                <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                                    <input type="radio" name="visibility" value="private" checked={data.visibility === 'private' || Boolean(forcedPrivate)} onChange={() => setData('visibility', 'private')} />
                                    <span><strong className="block text-sm">Private / sensitive</strong><span className="text-xs text-slate-600">Restricted handling; not shown on the public feed.</span></span>
                                </label>
                                {forcedPrivate && <p className="text-xs font-semibold text-rose-800">This subcategory is force-private. It cannot be made public.</p>}
                                {errors.visibility && <p role="alert" className="text-xs text-red-700">{errors.visibility}</p>}
                            </fieldset>
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                                Do not promise anonymity or account verification. Sensitive cases are kept private and handled only by authorized staff; avoid recording unnecessary personal details.
                            </div>
                        </div>
                    </section>}

                    <div className="flex flex-wrap gap-3">
                        {step > 1 && <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>}
                        {step < 2 && <Button type="button" onClick={() => setStep(2)} className="bg-cyan-800 text-white hover:bg-cyan-900">Continue to location</Button>}
                        {step === 2 &&
                        <Button type="submit" disabled={processing} className="bg-cyan-800 text-white hover:bg-cyan-900">
                            {processing ? 'Saving and analyzing...' : 'Log concern and start triage'}
                        </Button>
                        }
                        <Button type="button" variant="outline" asChild><Link href="/admin/reports">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}