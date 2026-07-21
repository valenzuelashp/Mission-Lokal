import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Upload, X } from 'lucide-react';
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

            <Button variant="ghost" className="mb-3 -ml-2 h-auto px-2 text-sm sm:mb-4" asChild>
                <Link href={`/personnel/missions/${mission.id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to mission
                </Link>
            </Button>

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Proof of completion</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {mission.id} · {mission.title}
                </p>
            </div>

            <form onSubmit={submit} className="w-full max-w-2xl space-y-4">
                <Card className="shadow-sm">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <div className="grid gap-2 rounded-lg border bg-slate-50 p-3 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">Location</p>
                                <p className="font-medium">{mission.location}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Due</p>
                                <p className="font-medium">{mission.due_date}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            Photos and field notes are required before completing this mission.
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-sm font-semibold">Photos</h3>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-300 sm:py-10">
                            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">Add before/after photos</span>
                            <span className="mt-1 text-xs text-muted-foreground">
                                Upload up to 5 images (max 5MB each)
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
                                <p className="text-sm font-medium text-slate-700">
                                    {data.photos.length} file{data.photos.length !== 1 ? 's' : ''} selected:
                                </p>
                                <ul className="space-y-1">
                                    {data.photos.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                                            <span className="truncate max-w-[280px] sm:max-w-md">{file.name}</span>
                                            <span className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {errors.photos && <p className="text-sm text-destructive">{errors.photos}</p>}
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="space-y-2 p-4 sm:p-5">
                        <Label htmlFor="notes">Field notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Describe work completed, materials used, follow-up needed…"
                            rows={5}
                        />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="submit"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 sm:w-auto"
                        disabled={processing || !data.notes.trim()}
                    >
                        Confirm & resolve
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
                        <Link href={`/personnel/missions/${mission.id}`}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </PersonnelLayout>
    );
}