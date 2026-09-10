import { Link, useForm, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { Bell, CalendarDays, HandHelping, ImagePlus, X } from 'lucide-react';
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
    is_published: boolean;
    image: File | null;
    remove_image: boolean;
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
    const { data, setData, processing, errors } = useForm(defaults);
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);

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
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Announcement details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Post type</Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                                        onClick={() => setData('kind', option.value)}
                                        className={cn(
                                            'rounded-xl border px-3 py-3 text-left transition',
                                            selected
                                                ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                                                : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50',
                                        )}
                                    >
                                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <Icon className="h-4 w-4 text-teal-700" />
                                            {option.label}
                                        </span>
                                        <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                                            {option.hint}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.kind && <p className="text-sm text-destructive">{errors.kind}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Water interruption advisory"
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body">Body</Label>
                        <Textarea
                            id="body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Write the full announcement text residents will read…"
                            rows={8}
                        />
                        {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Cover image (optional)</Label>
                        {previewUrl ? (
                            <div className="relative overflow-hidden rounded-lg border">
                                <img src={previewUrl} alt="" className="h-40 w-full object-cover" />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="absolute right-2 top-2 h-8 w-8"
                                    onClick={clearImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50"
                            >
                                <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-medium">Upload image</span>
                                <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP</span>
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
                            <Button type="button" variant="outline" size="sm" asChild>
                                <label htmlFor="image" className="cursor-pointer">
                                    Replace image
                                </label>
                            </Button>
                        )}
                        {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Publish immediately (visible to residents)
                    </label>

                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 sm:w-auto" disabled={processing}>
                            {submitLabel}
                        </Button>
                        {!data.is_published && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={processing}
                                onClick={(e) => submit(e, true)}
                            >
                                Save & publish
                            </Button>
                        )}
                        <Button type="button" variant="ghost" className="w-full sm:w-auto" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </div>

                    {data.kind === 'volunteer' && volunteers.length > 0 && (
                        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
                            <p className="text-sm font-semibold text-teal-900">
                                Volunteers ({volunteers.length})
                            </p>
                            <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                                {volunteers.map((person) => (
                                    <li key={person.id} className="flex items-center justify-between gap-2">
                                        <span>{person.name}</span>
                                        {person.joined_at && (
                                            <span className="text-xs text-muted-foreground">{person.joined_at}</span>
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
            />
        </form>
    );
}
