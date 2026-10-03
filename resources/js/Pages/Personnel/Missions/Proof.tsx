import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, ShieldAlert } from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { demoPersonnelMissions } from '@/Lib/personnelDemo';
import type { PersonnelMissionPageProps } from '@/Types';

export default function Proof(props: Partial<PersonnelMissionPageProps>) {
    const mission = props.mission ?? demoPersonnelMissions[0];

    const { data, setData, post, processing, errors } = useForm({
        notes: '',
        photos: [] as File[],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/personnel/missions/${mission.id}/proof`);
    };

    return (
        <PersonnelLayout title={`Mission-Lokal Personnel: Proof — ${mission.id}`}>
            <Head title={`Proof — ${mission.id}`} />

            <div className="mb-4">
                <Button variant="ghost" className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer" asChild>
                    <Link href={`/personnel/missions/${mission.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Mission Details
                    </Link>
                </Button>
            </div>

            <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Submit Execution Proof</h2>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                    {mission.id} · {mission.title}
                </p>
            </div>

            <form onSubmit={submit} className="w-full max-w-2xl space-y-6">
                <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                    <CardContent className="space-y-4 p-5 sm:p-6">
                        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs sm:grid-cols-2">
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider block">Operational Location</span>
                                <span className="font-bold text-slate-900 mt-0.5 block">{mission.location}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-bold uppercase tracking-wider block">Target Deadline</span>
                                <span className="font-bold text-slate-900 mt-0.5 block">{mission.due_date}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900">
                            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                            Before/after photographic evidence and field notes are mandatory to verify completion.
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                    <CardContent className="space-y-4 p-5 sm:p-6">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Photographic Evidence</h3>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center transition-all hover:border-blue-300 hover:bg-slate-50">
                            <Upload className="mb-2 h-8 w-8 text-blue-600" />
                            <span className="text-xs font-bold text-slate-800">Tap to upload before/after photos</span>
                            <span className="mt-1 text-[11px] text-muted-foreground">
                                Up to 5 image files (Max 5MB each)
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="sr-only"
                                onChange={(e) => setData('photos', Array.from(e.target.files ?? []))}
                            />
                        </label>

                        {data.photos.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-700">
                                    {data.photos.length} file{data.photos.length !== 1 ? 's' : ''} queued for upload:
                                </p>
                                <ul className="space-y-1.5">
                                    {data.photos.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700">
                                            <span className="truncate max-w-[280px] sm:max-w-md">{file.name}</span>
                                            <span className="text-muted-foreground font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {errors.photos && <p className="text-xs font-medium text-red-600">{errors.photos}</p>}
                    </CardContent>
                </Card>

                <Card className="shadow-xs border-slate-200/80 bg-white rounded-2xl">
                    <CardContent className="space-y-3 p-5 sm:p-6">
                        <Label htmlFor="notes">Field Execution Summary & Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Detail work performed, materials deployed, or follow-up requirements..."
                            rows={5}
                            className="bg-white resize-none"
                        />
                        {errors.notes && <p className="text-xs font-medium text-red-600">{errors.notes}</p>}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 sm:w-auto shadow-sm cursor-pointer"
                        disabled={processing || !data.notes.trim()}
                    >
                        Submit Proof & Complete Task
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto font-bold text-xs cursor-pointer" asChild>
                        <Link href={`/personnel/missions/${mission.id}`}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </PersonnelLayout>
    );
}