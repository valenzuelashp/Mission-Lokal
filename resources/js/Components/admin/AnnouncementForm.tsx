import { Link, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import AnnouncementPreview from '@/Components/admin/AnnouncementPreview';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';

type FormData = {
    title: string;
    body: string;
    is_published: boolean;
    image: File | null;
    remove_image: boolean;
};

type Props = {
    action: string;
    method: 'post' | 'put';
    defaults: FormData;
    existingImageUrl?: string | null;
    cancelHref: string;
    submitLabel: string;
};

export default function AnnouncementForm({
    action,
    method,
    defaults,
    existingImageUrl,
    cancelHref,
    submitLabel,
}: Props) {
    const publishRef = useRef(false);
    const { data, setData, transform, post, put, processing, errors } = useForm(defaults);
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl ?? null);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    transform((d) => ({
        ...d,
        is_published: publishRef.current ? true : d.is_published,
    }));

    const submit = (e: FormEvent, publish = false) => {
        e.preventDefault();
        publishRef.current = publish;
        const options = { forceFormData: true };
        if (method === 'post') {
            post(action, options);
        } else {
            put(action, options);
        }
        publishRef.current = false;
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
        <form onSubmit={(e) => submit(e)} className="grid gap-6 lg:grid-cols-2 items-start">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-neutral-100 bg-white/40 px-5 py-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-neutral-800">Announcement Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-neutral-800">Advisory Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Scheduled water service interruption"
                            className="rounded-xl border-neutral-200 bg-white text-xs font-bold shadow-xs placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900 h-10"
                        />
                        {errors.title && <p className="text-xs font-bold text-neutral-900 mt-1">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body" className="text-xs font-black uppercase tracking-widest text-neutral-800">Content Body</Label>
                        <Textarea
                            id="body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Write the comprehensive bulletin description detailing exact operational windows, affected zones, and community guidelines..."
                            rows={8}
                            className="rounded-xl border-neutral-200 bg-white text-xs font-semibold shadow-xs placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900 leading-relaxed"
                        />
                        {errors.body && <p className="text-xs font-bold text-neutral-900 mt-1">{errors.body}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-xs font-black uppercase tracking-widest text-neutral-800">Cover Media Asset</Label>
                        {previewUrl ? (
                            <div className="relative overflow-hidden rounded-xl border border-neutral-200 shadow-inner group">
                                <img src={previewUrl} alt="" className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-102" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                <Button
                                    type="button"
                                    size="icon"
                                    className="absolute right-3 top-3 h-7 w-7 rounded-lg bg-neutral-900/90 text-white shadow-md backdrop-blur-xs hover:bg-neutral-900 transition-all"
                                    onClick={clearImage}
                                >
                                    <X className="h-3.5 w-3.5 stroke-[2.5]" />
                                </Button>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/40 px-4 py-8 text-center transition-all duration-200 hover:border-neutral-900 hover:bg-white"
                            >
                                <ImagePlus className="mb-2 h-6 w-6 text-neutral-400" />
                                <span className="text-xs font-black uppercase tracking-wider text-neutral-900">Upload media attachment</span>
                                <span className="mt-1 text-[10px] font-medium text-neutral-400">JPG, PNG, or WebP standards</span>
                            </label>
                        )}
                        <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className={previewUrl ? 'sr-only' : 'hidden'}
                            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                        />
                        {previewUrl && (
                            <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg border-neutral-200 text-[10px] font-black uppercase tracking-wider bg-white shadow-xs hover:bg-neutral-50 mt-1.5" asChild>
                                <label htmlFor="image" className="cursor-pointer">
                                    Replace image file
                                </label>
                            </Button>
                        )}
                        {errors.image && <p className="text-xs font-bold text-neutral-900 mt-1">{errors.image}</p>}
                    </div>

                    <div className="pt-2 border-t border-neutral-100">
                        <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-neutral-700 tracking-tight select-none">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="h-4 w-4 rounded-md border-neutral-300 text-neutral-900 focus:ring-neutral-900 transition-colors"
                            />
                            Broadcast immediately (visible across resident public feeds)
                        </label>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-3 sm:flex-row sm:flex-wrap">
                        <Button type="submit" className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5" disabled={processing}>
                            {submitLabel}
                        </Button>
                        {!data.is_published && (
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 rounded-xl font-black uppercase tracking-widest text-xs h-10 shadow-sm transition-all active:scale-[0.98] sm:w-auto px-5"
                                disabled={processing}
                                onClick={(e) => submit(e, true)}
                            >
                                Commit & publish
                            </Button>
                        )}
                        <Button type="button" variant="ghost" className="w-full border-transparent hover:bg-neutral-50 rounded-xl font-black uppercase tracking-widest text-xs h-10 text-neutral-500 hover:text-neutral-900 sm:w-auto px-5 transition-colors" asChild>
                            <Link href={cancelHref}>Cancel</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AnnouncementPreview
                title={data.title}
                body={data.body}
                imageUrl={previewUrl}
                isPublished={data.is_published}
                publishedAt={data.is_published ? 'Just now' : null}
            />
        </form>
    );
}