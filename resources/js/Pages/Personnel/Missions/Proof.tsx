import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, Upload, ShieldAlert, AlertCircle } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import { demoPersonnelMissions } from '@/Lib/personnelDemo';
import {
    deletePersonnelProofDraft,
    loadPersonnelProofDraft,
    savePersonnelProofDraft,
} from '@/Lib/personnelProofDraft';
import type { PersonnelProofDraft, WorkLocationSource } from '@/Lib/personnelProofDraft';
import type { PageProps, PersonnelMissionPageProps } from '@/Types';

function createSubmissionId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function Proof(props: Partial<PersonnelMissionPageProps>) {
    const mission = props.mission ?? demoPersonnelMissions[0];
    const { flash, errors: sharedErrors } = usePage<PageProps & { errors?: Record<string, string> }>().props;
    const [initialSubmissionId] = useState(createSubmissionId);
    const [locationStatus, setLocationStatus] = useState('Work-site GPS is optional');
    const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' || navigator.onLine);
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [hasDraftContent, setHasDraftContent] = useState(false);
    const [queuedForUpload, setQueuedForUpload] = useState(false);
    const [draftMessage, setDraftMessage] = useState('');
    const [draftError, setDraftError] = useState('');
    const submissionInProgress = useRef(false);
    const submissionSucceeded = useRef(false);
    const validationFailed = useRef(false);
    const saveTimer = useRef<number | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        client_submission_id: initialSubmissionId,
        notes: '',
        photos: [] as File[],
        latitude: '',
        longitude: '',
        location_accuracy_m: '',
        work_location: mission.work_location || mission.location,
        work_location_source: 'mission_location' as WorkLocationSource,
        location_note: '',
    });

    const draftSnapshot = (queued: boolean): PersonnelProofDraft => ({
        missionId: mission.id,
        clientSubmissionId: data.client_submission_id,
        notes: data.notes,
        photos: data.photos,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAccuracyM: data.location_accuracy_m,
        workLocation: data.work_location,
        workLocationSource: data.work_location_source,
        locationNote: data.location_note,
        queuedForUpload: queued,
        savedAt: Date.now(),
    });

    useEffect(() => {
        let active = true;
        loadPersonnelProofDraft(mission.id)
            .then((draft) => {
                if (!active || !draft) return;
                setData({
                    client_submission_id: draft.clientSubmissionId,
                    notes: draft.notes,
                    photos: draft.photos,
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                    location_accuracy_m: draft.locationAccuracyM,
                    work_location: draft.workLocationSource === 'onsite_gps' ? draft.workLocation : mission.work_location || mission.location,
                    work_location_source: draft.workLocationSource === 'onsite_gps' ? 'onsite_gps' : 'mission_location',
                    location_note: draft.locationNote,
                });
                setHasDraftContent(true);
                setQueuedForUpload(draft.queuedForUpload);
                setDraftMessage(draft.queuedForUpload
                    ? 'A saved proof is queued and will upload when this device is connected.'
                    : 'A saved proof draft was restored from this device.');
            })
            .catch((error: unknown) => {
                if (active) setDraftError(error instanceof Error ? error.message : 'Could not load the saved proof draft.');
            })
            .finally(() => {
                if (active) setDraftLoaded(true);
            });

        return () => {
            active = false;
        };
    }, [mission.id, setData]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!draftLoaded || !hasDraftContent || submissionSucceeded.current) return;
        if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => {
            savePersonnelProofDraft(draftSnapshot(queuedForUpload))
                .then(() => {
                    setDraftError('');
                    if (!queuedForUpload && !submissionInProgress.current && !validationFailed.current) {
                        setDraftMessage('Draft saved on this device.');
                    }
                })
                .catch((error: unknown) => setDraftError(error instanceof Error ? error.message : 'Could not save this proof on the device.'));
        }, 400);

        return () => {
            if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
        };
    }, [data, draftLoaded, hasDraftContent, queuedForUpload]);

    const postProof = () => {
        if (submissionInProgress.current) return;
        submissionInProgress.current = true;
        submissionSucceeded.current = false;
        validationFailed.current = false;
        post(`/personnel/missions/${mission.id}/proof`, {
            onSuccess: () => {
                submissionSucceeded.current = true;
                if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
                setQueuedForUpload(false);
                setHasDraftContent(false);
                setDraftError('');
                setDraftMessage('Proof uploaded successfully. The saved device copy is being cleared.');
                void deletePersonnelProofDraft(mission.id).catch((error: unknown) => {
                    setDraftError(error instanceof Error ? error.message : 'Proof was uploaded, but the local draft could not be cleared.');
                });
            },
            onError: () => {
                validationFailed.current = true;
                setQueuedForUpload(false);
                setDraftMessage('The server could not accept this proof yet. Your saved draft is still available; correct the errors and submit again.');
            },
            onFinish: () => {
                submissionInProgress.current = false;
                if (!submissionSucceeded.current && !validationFailed.current) {
                    setQueuedForUpload(false);
                    setDraftMessage('Upload could not be confirmed. Your draft is saved on this device; reconnect and submit again.');
                }
            },
        });
    };

    useEffect(() => {
        if (draftLoaded && queuedForUpload && isOnline && !processing) postProof();
    }, [draftLoaded, queuedForUpload, isOnline, processing]);

    const captureLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('This device does not provide location services. Select a reported location instead.');
            return;
        }

        setLocationStatus('Capturing work-site location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setData('latitude', String(position.coords.latitude));
                setData('longitude', String(position.coords.longitude));
                setData('location_accuracy_m', String(position.coords.accuracy));
                setData('work_location_source', 'onsite_gps');
                setHasDraftContent(true);
                setLocationStatus(`Location captured, accuracy ±${Math.round(position.coords.accuracy)} m`);
            },
            () => setLocationStatus('GPS was not captured. The assigned mission location will be used.'),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
        );
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setHasDraftContent(true);
        if (!isOnline || !navigator.onLine) {
            setQueuedForUpload(true);
            setDraftMessage('Saving proof on this device and queueing it for upload when connectivity returns...');
            try {
                await savePersonnelProofDraft(draftSnapshot(true));
                setDraftError('');
                setDraftMessage('Proof saved on this device and queued. It will upload when connectivity returns. Keep this browser profile available.');
            } catch (error) {
                setQueuedForUpload(false);
                setDraftError(error instanceof Error ? error.message : 'Could not save this proof offline.');
            }
            return;
        }

        try {
            await savePersonnelProofDraft(draftSnapshot(false));
            setDraftError('');
        } catch (error) {
            setDraftError(error instanceof Error ? error.message : 'Could not save a local copy of this proof.');
        }
        postProof();
    };

    const discardDraft = async () => {
        if (!window.confirm('Delete this proof draft and its photos from this device?')) return;
        if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
        try {
            await deletePersonnelProofDraft(mission.id);
            setData({
                client_submission_id: createSubmissionId(),
                notes: '',
                photos: [],
                latitude: '',
                longitude: '',
                location_accuracy_m: '',
                work_location: mission.work_location || mission.location,
                work_location_source: 'mission_location',
                location_note: '',
            });
            setHasDraftContent(false);
            setQueuedForUpload(false);
            setDraftError('');
            setDraftMessage('The local proof draft was deleted.');
        } catch (error) {
            setDraftError(error instanceof Error ? error.message : 'Could not delete the saved proof draft.');
        }
    };

    const notesValid = data.notes.trim().length >= 20;
    const locationValid = data.work_location.trim() !== ''
        && (data.work_location_source !== 'onsite_gps' || Boolean(data.latitude));

    return (
        <PersonnelLayout title={`Mission-Lokal Personnel: Proof — ${mission.display_id ?? mission.id}`}>
            <Head title={`Proof — ${mission.display_id ?? mission.id}`} />

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
                <p className="mt-1 break-words text-xs sm:text-sm font-medium text-slate-500">
                    {mission.display_id ?? mission.id} · {mission.title}
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
                            <p className="leading-relaxed">Add a work photo and at least 20 characters describing the work. GPS is optional.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="space-y-5 p-6 sm:p-8">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Photographic Evidence</h3>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center transition-all hover:border-blue-300 hover:bg-slate-50">
                            <Upload className="mb-3 h-10 w-10 text-blue-600" />
                            <span className="text-xs sm:text-sm font-black text-slate-900">Tap to upload work photos</span>
                            <span className="mt-1 text-xs text-muted-foreground font-medium">
                                JPG or PNG, at least 720 × 480 px in either orientation, up to 5MB each
                            </span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                disabled={!draftLoaded}
                                className="sr-only"
                                onChange={(e) => {
                                    setData('photos', Array.from(e.target.files ?? []));
                                    setHasDraftContent(true);
                                }}
                            />
                        </label>

                        {data.photos.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-600">{data.photos.length} photo{data.photos.length === 1 ? '' : 's'} selected for proof.</p>
                                {data.photos.map((file, index) => (
                                    <p key={`${file.name}-${index}`} className="flex justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                                        <span className="min-w-0 truncate">{file.name}</span>
                                        <span className="shrink-0 text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </p>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                                <span>{locationStatus}</span>
                            </p>
                            <Button type="button" variant="outline" onClick={captureLocation} disabled={!draftLoaded} className="font-black text-xs rounded-xl h-11 px-5 cursor-pointer">
                                <MapPin className="mr-2 h-4 w-4" />Capture Work-Site GPS
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            {data.work_location_source === 'onsite_gps'
                                ? 'Work-site GPS captured. The assigned mission location is also recorded.'
                                : `Work location: ${data.work_location}. This assigned location is used unless you capture GPS at the work site.`}
                            {' '}If you are reporting work done earlier, include when in the summary below.
                        </p>

                        {errors.latitude && <p className="text-xs font-medium text-destructive">{errors.latitude}</p>}
                        {errors.longitude && <p className="text-xs font-medium text-destructive">{errors.longitude}</p>}
                        {errors.location_accuracy_m && <p className="text-xs font-medium text-destructive">{errors.location_accuracy_m}</p>}
                        {errors.photos && <p className="text-xs font-medium text-destructive">{errors.photos}</p>}
                    </CardContent>
                </Card>

                <Card className="shadow-2xs border-slate-200/80 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="space-y-4 p-6 sm:p-8">
                        <Label htmlFor="notes" className="text-sm font-black uppercase tracking-wider text-slate-800">Field Execution Summary & Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            disabled={!draftLoaded}
                            onChange={(e) => {
                                setData('notes', e.target.value);
                                setHasDraftContent(true);
                            }}
                            placeholder="Describe the work performed, materials used, or follow-up needed. If you are uploading later, include when the work happened."
                            rows={6}
                            className="bg-white resize-none rounded-2xl p-4 text-xs"
                        />
                        {errors.notes && <p className="text-xs font-medium text-destructive">{errors.notes}</p>}
                        <p className="text-xs text-slate-500">{data.notes.trim().length}/20 minimum characters</p>
                    </CardContent>
                </Card>

                <div className="space-y-2" aria-live="polite">
                    <p className={`rounded-xl px-4 py-3 text-xs font-semibold ${isOnline ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
                        {isOnline ? 'Connected. Proof will upload to the server when submitted.' : 'Offline. Submit to save and queue this proof on this device. Keep this page open to upload automatically when you reconnect; if you close it, reopen this mission proof page once online.'}
                    </p>
                    {(draftMessage || draftError || sharedErrors?.checklist || sharedErrors?.status || sharedErrors?.proof) && (
                        <div
                            role={draftError || sharedErrors?.checklist || sharedErrors?.status || sharedErrors?.proof ? 'alert' : 'status'}
                            className={`rounded-xl px-4 py-3 text-xs font-semibold ${draftError || sharedErrors?.checklist || sharedErrors?.status || sharedErrors?.proof ? 'bg-red-50 text-red-900' : 'bg-sky-50 text-sky-900'}`}
                        >
                            {draftError || sharedErrors?.checklist || sharedErrors?.status || sharedErrors?.proof || draftMessage}
                        </div>
                    )}
                    <p className="text-xs leading-relaxed text-slate-500">Offline photos and notes stay in this browser on this device until successfully uploaded. Avoid saving proof on a shared device.</p>
                </div>

                <div className="flex flex-col gap-3.5 pt-2 sm:flex-row">
                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 sm:w-auto shadow-sm cursor-pointer rounded-2xl px-8 h-12"
                        disabled={!draftLoaded || processing || !notesValid || data.photos.length === 0 || !locationValid}
                    >
                        {!isOnline ? 'Save & Queue Proof Offline' : queuedForUpload ? 'Uploading Saved Proof...' : 'Submit Proof & Complete Task'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto font-black text-xs py-3.5 cursor-pointer rounded-2xl px-8 h-12" asChild>
                        <Link href={`/personnel/missions/${mission.id}`}>Cancel</Link>
                    </Button>
                    {hasDraftContent && (
                        <Button type="button" variant="outline" onClick={discardDraft} className="w-full sm:w-auto font-black text-xs py-3.5 rounded-2xl px-8 h-12">
                            Delete Device Draft
                        </Button>
                    )}
                </div>
            </form>
        </PersonnelLayout>
    );
}
