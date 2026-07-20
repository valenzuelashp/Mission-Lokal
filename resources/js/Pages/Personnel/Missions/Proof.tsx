import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Upload } from 'lucide-react';
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

            <Button variant="ghost" className="mb-4 -ml-2 h-auto px-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors hover:bg-transparent" asChild>
                <Link href={`/personnel/missions/${mission.id}`}>
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 stroke-[2.5]" />
                    Back to detail
                </Link>
            </Button>

            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Proof of completion</h2>
                <p className="mt-1 text-xs font-bold text-neutral-400 tracking-wider uppercase">
                    {mission.id} · {mission.title}
                </p>
            </div>

            <form onSubmit={submit} className="w-full max-w-2xl space-y-5">
                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="space-y-4 p-4 sm:p-5">
                        <div className="grid gap-3 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-4 text-xs font-bold tracking-tight text-neutral-700 sm:grid-cols-2">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Location target</p>
                                <p className="font-black text-neutral-800 mt-0.5 leading-relaxed">{mission.location}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Due parameter</p>
                                <p className="font-black text-neutral-800 mt-0.5 tabular-nums">{mission.due_date}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white p-3.5 text-xs font-bold text-neutral-800 shadow-xs">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900" />
                            <span className="leading-relaxed">Verification protocol: Digital imagery arrays and diagnostic operational text entries are needed before ledger execution.</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Field Area */}
                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="space-y-3 p-4 sm:p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-800">Photos</h3>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/40 px-4 py-8 text-center transition-all duration-200 hover:border-neutral-900 hover:bg-white sm:py-10">
                            <Upload className="mb-2.5 h-6 w-6 text-neutral-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-neutral-900">Add before/after photos</span>
                            <span className="mt-1 text-[10px] font-medium text-neutral-400">
                                Demo execution environment — local stream state active
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
                            <p className="text-xs font-black uppercase tracking-wider text-neutral-400 bg-neutral-50 border px-2.5 py-1 rounded-lg w-fit">
                                {data.photos.length} file{data.photos.length !== 1 ? 's' : ''} staged
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Textarea Area */}
                <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="space-y-2 p-4 sm:p-5">
                        <Label htmlFor="notes" className="text-xs font-black uppercase tracking-widest text-neutral-800">Field logs & notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Describe technical work accomplished, resource materials initialized, follow-up parameters needed..."
                            rows={5}
                            className="rounded-xl border-neutral-200/80 bg-white text-xs font-semibold focus:border-neutral-900 focus:ring-neutral-900 leading-relaxed"
                        />
                        {errors.notes && <p className="text-xs font-bold text-neutral-900 mt-1">{errors.notes}</p>}
                    </CardContent>
                </Card>

                {/* Form Trigger Row */}
                <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Button
                        type="submit"
                        className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5"
                        disabled={processing || !data.notes.trim()}
                    >
                        Confirm & resolve
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-neutral-200 bg-white/80 hover:bg-white text-neutral-700 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm sm:w-auto px-5" asChild>
                        <Link href={`/personnel/missions/${mission.id}`}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </PersonnelLayout>
    );
}