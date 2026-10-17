import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, Upload, ShieldAlert, AlertCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { demoPersonnelMissions } from '@/Lib/personnelDemo';
import type { PageProps, PersonnelMissionPageProps } from '@/Types';

export default function Proof(props: Partial<PersonnelMissionPageProps>) {
    const mission = props.mission ?? demoPersonnelMissions[0];
    const { flash } = usePage<PageProps>().props;
    const [locationStatus, setLocationStatus] = useState('Location not captured');

    const { data, setData, post, processing, errors } = useForm({
        notes: '',
        photos: [] as File[],
        latitude: '',
        longitude: '',
        location_accuracy_m: '',
    });

    const captureLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('This device does not provide location services.');
            return;
        }

        setLocationStatus('Capturing current location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData('latitude', String(position.coords.latitude));
                setData('longitude', String(position.coords.longitude));
                setData('location_accuracy_m', String(position.coords.accuracy));
                setLocationStatus(`Location captured, accuracy ±${Math.round(position.coords.accuracy)} m`);
            },
            () => setLocationStatus('Location permission is required to submit proof.'),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/personnel/missions/${mission.id}/proof`);
    };

    return (
        <PersonnelLayout title={`Mission-Lokal Personnel: Proof — ${mission.id}`}>
            <Head title={`Proof — ${mission.id}`} />

            {flash.success && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-xs font-bold text-emerald-900 shadow-2xs">
                    <AlertCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                    {flash.success}
                </div>
            )}

            <div>
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer p-0 h-auto mb-3" asChild>
                    <Link href={`/personnel/missions/${mission.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Mission Details
                    </Link>
                </Button>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Submit Execution Proof</h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    {mission.id} · {mission.title}
                </p>
            </div>

            <form onSubmit={submit} className="w-full max-w-3xl space-y-6">
                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="space-y-5 p-6 sm:p-8">
                        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-xs sm:grid-cols-2">
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider block">Operational Location</span>
                                <span className="font-black text-slate-900 mt-1 block text-sm">{mission.location}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider block">Target Deadline</span>
                                <span className="font-black text-slate-900 mt-1 block text-sm">{mission.due_date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
                            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
                            <p className="leading-relaxed">Before/after photographic evidence and field notes are mandatory to verify completion.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="space-y-5 p-6 sm:p-8">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Photographic Evidence</h3>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center transition-all hover:border-blue-300 hover:bg-slate-50">
                            <Upload className="mb-3 h-10 w-10 text-blue-600" />
                            <span className="text-xs sm:text-sm font-black text-slate-900">Tap to upload before/after photos</span>
                            <span className="mt-1 text-xs text-muted-foreground font-medium">
                                JPG or PNG, minimum 720 × 480 px, up to 5MB each
                            </span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                className="sr-only"
                                onChange={(e) => setData('photos', Array.from(e.target.files ?? []))}
                            />
                        </label>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>{locationStatus}</span>
                            </p>
                            <Button type="button" variant="outline" onClick={captureLocation} className="font-black text-xs rounded-xl h-11 px-5 cursor-pointer">
                                <MapPin className="mr-2 h-4 w-4" />Capture Current Location
                            </Button>
                        </div>

                        {errors.latitude && <p className="text-xs font-medium text-destructive">{errors.latitude}</p>}
                        {errors.longitude && <p className="text-xs font-medium text-destructive">{errors.longitude}</p>}
                        {errors.location_accuracy_m && <p className="text-xs font-medium text-destructive">{errors.location_accuracy_m}</p>}
                        
                        {data.photos.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <p className="text-xs font-black text-slate-800">
                                    {data.photos.length} file{data.photos.length !== 1 ? 's' : ''} queued for upload:
                                </p>
                                <ul className="space-y-2">
                                    {data.photos.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700">
                                            <span className="truncate max-w-[260px] sm:max-w-md">{file.name}</span>
                                            <span className="text-muted-foreground font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {errors.photos && <p className="text-xs font-medium text-destructive">{errors.photos}</p>}
                    </CardContent>
                </Card>

                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="space-y-4 p-6 sm:p-8">
                        <Label htmlFor="notes" className="text-sm font-black uppercase tracking-wider text-slate-800">Field Execution Summary & Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Detail work performed, materials deployed, or follow-up requirements..."
                            rows={6}
                            className="bg-white resize-none rounded-2xl p-4 text-xs"
                        />
                        {errors.notes && <p className="text-xs font-medium text-destructive">{errors.notes}</p>}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3.5 pt-2 sm:flex-row">
                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 sm:w-auto shadow-sm cursor-pointer rounded-2xl px-8 h-12"
                        disabled={processing || data.notes.trim().length < 20 || data.photos.length === 0 || !data.latitude}
                    >
                        Submit Proof & Complete Task
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto font-black text-xs py-3.5 cursor-pointer rounded-2xl px-8 h-12" asChild>
                        <Link href={`/personnel/missions/${mission.id}`}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </PersonnelLayout>
    );
}