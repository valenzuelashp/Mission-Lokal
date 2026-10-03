import { Link, useForm, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { Bell, CalendarDays, HandHelping, ImagePlus, X, Sparkles } from 'lucide-react';
import AnnouncementPreview from '@/Components/admin/AnnouncementPreview';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/Lib/utils';
import { announcementKindOptions, type AnnouncementKind } from '@/Types';

type FormData = {
    title: string;
    body: string;
    kind: AnnouncementKind;
    event_at: string;
    is_published: boolean;
    image: File | null;
    remove_image: boolean;
    [key: string]: any;
};

type Volunteer = { id: string; name: string; joined_at: string | null };

type Props = {
    action: string;
    method: 'post' | 'put';
    defaults: FormData;
    existingImageUrl?: string | null;
    cancelHref: string;
    submitLabel: string;
    volunteers?: Volunteer[];
};

export default function AnnouncementForm({
    action,
    method,
    defaults,
    existingImageUrl,
    cancelHref,
    submitLabel,
    volunteers = [],
}: Props) {
    const { data, setData, processing, errors } = useForm<FormData>(defaults);
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);
    const needsSchedule = data.kind === 'event' || data.kind === 'volunteer';

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const submit = (e: FormEvent, publishOverride = false) => {
        e.preventDefault();

        const publishState = publishOverride ? true : data.is_published;
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('body', data.body);
        formData.append('kind', data.kind);
        formData.append('event_at', needsSchedule ? data.event_at : '');
        formData.append('is_published', publishState ? '1' : '0');
        formData.append('remove_image', data.remove_image ? '1' : '0');

        if (data.image) {
            formData.append('image', data.image);
        }

        if (method === 'put') {
            formData.append('_method', 'PUT');
        }

        router.post(action, formData, {
            forceFormData: true,
        });
    };

    const onImageChange = (file: File | null) => {
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setData('image', file);
        setData('remove_image', false);
        setPreviewUrl(file ? URL.createObjectURL(file) : existingImageUrl ?? null);
    };

    const clearImage = () => {
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setData('image', null);
        setData('remove_image', true);
        setPreviewUrl(null);
    };

    return (
        <form onSubmit={(e) => submit(e, false)} className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-sm border-slate-200/80 bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        Announcement Builder
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Broadcast Type</Label>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                            {announcementKindOptions.map((option) => {
                                const Icon =
                                    option.value === 'advisory'
                                        ? Bell
                                        : option.value === 'event'
                                        ? CalendarDays
                                        : HandHelping;
                                const selected = data.kind === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setData('kind', option.value as AnnouncementKind)}
                                        className={cn(
                                            'rounded-xl border p-3.5 text-left transition-all cursor-pointer',
                                            selected
                                                ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-600/20 shadow-xs'
                                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50',
                                        )}
                                    >
                                        <span className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                            <Icon className={cn('h-4 w-4', selected ? 'text-blue-700' : 'text-slate-500')} />
                                            {option.label}
                                        </span>
                                        <span className="mt-1.5 block text-[11px] leading-snug text-muted-foreground">
                                            {option.hint}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.kind && <p className="text-xs font-medium text-red-600">{errors.kind}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-700">Headline Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Municipal Water Interruption Advisory"
                            className="bg-white h-10"
                        />
                        {errors.title && <p className="text-xs font-medium text-red-600">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body" className="text-xs font-bold uppercase tracking-wider text-slate-700">Detailed Information</Label>
                        <Textarea
                            id="body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Provide full description, instructions, or scope for the residents…"
                            rows={7}
                            className="bg-white resize-none"
                        />
                        {errors.body && <p className="text-xs font-medium text-red-600">{errors.body}</p>}
                    </div>

                    {needsSchedule && (
                        <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                            <Label htmlFor="event_at" className="text-xs font-bold uppercase tracking-wider text-blue-900">
                                {data.kind === 'volunteer' ? 'Volunteer Activity Schedule' : 'Event Schedule Date & Time'}
                            </Label>
                            <Input
                                id="event_at"
                                type="datetime-local"
                                value={data.event_at}
                                onChange={(e) => setData('event_at', e.target.value)}
                                required
                                className="bg-white"
                            />
                            <p className="text-[11px] text-muted-foreground">Synchronized with official barangay calendar timeline.</p>
                            {errors.event_at && <p className="text-xs font-medium text-red-600">{errors.event_at}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-xs font-bold uppercase tracking-wider text-slate-700">Cover Media (Optional)</Label>
                        {previewUrl ? (
                            <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                                <img src={previewUrl} alt="" className="h-44 w-full object-cover" />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute right-3 top-3 h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-white"
                                    onClick={clearImage}
                                >
                                    <X className="h-4 w-4 text-slate-700" />
                                </Button>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center transition-all hover:bg-slate-50 hover:border-blue-300"
                            >
                                <ImagePlus className="mb-2 h-8 w-8 text-blue-600" />
                                <span className="text-xs font-bold text-slate-700">Click to upload cover graphic</span>
                                <span className="mt-0.5 text-[11px] text-muted-foreground">High-res JPG, PNG, or WebP</span>
                            </label>
                        )}
                        <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className={previewUrl ? 'sr-only' : ''}
                            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                        />
                        {previewUrl && (
                            <Button type="button" variant="outline" size="sm" asChild className="mt-2">
                                <label htmlFor="image" className="cursor-pointer text-xs">
                                    Replace image
                                </label>
                            </Button>
                        )}
                        {errors.image && <p className="text-xs font-medium text-red-600">{errors.image}</p>}
                    </div>

                    <div className="pt-2">
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 p-3 bg-slate-50/50 text-xs font-bold text-slate-800">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                            />
                            Publish immediately to active resident feed & PWA broadcast
                        </label>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-3 sm:flex-row sm:flex-wrap border-t border-slate-100">
                        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto shadow-sm cursor-pointer" disabled={processing}>
                            {submitLabel}
                        </Button>
                        {!data.is_published && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto border-blue-600 text-blue-700 hover:bg-blue-50 cursor-pointer"
                                disabled={processing}
                                onClick={(e) => submit(e, true)}
                            >
                                Save & Publish Instantly
                            </Button>
                        )}
                        <Button type="button" variant="ghost" className="w-full sm:w-auto cursor-pointer" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </div>

                    {data.kind === 'volunteer' && volunteers.length > 0 && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 mt-4">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-2">
                                Enrolled Volunteers ({volunteers.length})
                            </p>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                                {volunteers.map((person) => (
                                    <li key={person.id} className="flex items-center justify-between gap-2 bg-white/80 p-2 rounded border border-emerald-100">
                                        <span className="font-bold text-slate-900">{person.name}</span>
                                        {person.joined_at && (
                                            <span className="text-[11px] text-muted-foreground">{person.joined_at}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AnnouncementPreview
                title={data.title}
                body={data.body}
                kind={data.kind}
                imageUrl={previewUrl}
                isPublished={data.is_published}
                publishedAt={data.is_published ? 'Just now' : null}
                eventAt={needsSchedule ? data.event_at : null}
            />
        </form>
    );
}