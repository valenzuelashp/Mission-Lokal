import { Camera, ImagePlus, X } from 'lucide-react';
import { ChangeEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import ConcernCameraCapture from '@/Components/resident/ConcernCameraCapture';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { appendConcernPhotos, MAX_CONCERN_PHOTOS, prefersNativeConcernCamera } from '@/Lib/concernPhotos';

type Props = {
    files: File[];
    onChange: (files: File[]) => void;
    existingCount?: number;
    disabled?: boolean;
    error?: string;
};

function PhotoPreview({ file, index, disabled, onRemove }: { file: File; index: number; disabled: boolean; onRemove: () => void }) {
    const [src, setSrc] = useState('');
    const theme = useResidentTheme();
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setSrc(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return <li className="min-w-0">
        <div className={`relative overflow-hidden rounded-2xl border ${theme.cardBorder} ${theme.accentSurface}`}>
            {src && <img src={src} alt={`Selected concern photo ${index + 1}`} className="aspect-square w-full object-cover" />}
            <button type="button" disabled={disabled} onClick={onRemove} aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/75 text-white hover:bg-red-700 disabled:opacity-50">
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
        <p title={file.name} className={`mt-1 truncate text-xs ${theme.textMuted}`}>{file.name}</p>
    </li>;
}

export default function ConcernPhotoPicker({ files, onChange, existingCount = 0, disabled = false, error }: Props) {
    const theme = useResidentTheme();
    const id = useId();
    const gallery = useRef<HTMLInputElement>(null);
    const camera = useRef<HTMLInputElement>(null);
    const [selectionError, setSelectionError] = useState('');
    const [webcamOpen, setWebcamOpen] = useState(false);
    const remainingSlots = Math.max(0, MAX_CONCERN_PHOTOS - existingCount);
    const full = files.length >= remainingSlots;
    const message = selectionError || error;
    useEffect(() => { if (disabled || full) setWebcamOpen(false); }, [disabled, full]);
    const addPhotos = (incoming: File[]) => {
        const result = appendConcernPhotos(files, incoming, remainingSlots);
        setSelectionError(result.error);
        onChange(result.files);
    };
    const select = (event: ChangeEvent<HTMLInputElement>) => {
        const incoming = Array.from(event.currentTarget.files ?? []);
        // Clear the native input so another capture with the same filename still fires change.
        event.currentTarget.value = '';
        if (!incoming.length) return;
        addPhotos(incoming);
    };

    return <fieldset disabled={disabled} aria-describedby={`${id}-help`} className="min-w-0 space-y-3">
        <legend className={`text-xs font-bold ${theme.textMain}`}>Photographic Evidence (Optional)</legend>
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={disabled || full} aria-expanded={webcamOpen} onClick={() => {
                setSelectionError('');
                if (prefersNativeConcernCamera(navigator)) camera.current?.click();
                else setWebcamOpen(true);
            }}>
                <Camera className="h-4 w-4" aria-hidden="true" />Take a photo
            </Button>
            <Button type="button" variant="outline" disabled={disabled || full} onClick={() => gallery.current?.click()}>
                <ImagePlus className="h-4 w-4" aria-hidden="true" />Upload photos
            </Button>
        </div>
        <input ref={camera} type="file" accept="image/*" capture="environment" onChange={select} disabled={disabled || full} hidden aria-label="Take a photo with your camera" />
        <input ref={gallery} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={select} disabled={disabled || full} hidden aria-label="Upload concern photos" />
        <div id={`${id}-help`} className={`space-y-1 text-xs leading-relaxed ${theme.textMuted}`}>
            <p>Up to 4 photos, 4 MB each. JPG, PNG, or WebP. Take a photo uses your laptop webcam or your phone's camera.</p>
            {existingCount > 0 && <p>{existingCount} {existingCount === 1 ? 'photo is' : 'photos are'} already attached to this concern.</p>}
            <p aria-live="polite">{files.length + existingCount} of {MAX_CONCERN_PHOTOS} photos attached{full ? '. Photo limit reached.' : '.'}</p>
        </div>
        {webcamOpen && !disabled && !full && <ConcernCameraCapture onCapture={file => addPhotos([file])} onClose={() => setWebcamOpen(false)}
            onUpload={() => { setWebcamOpen(false); gallery.current?.click(); }} />}
        {files.length > 0 && <ul aria-label="Selected concern photos" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {files.map((file, index) => <PhotoPreview key={`${file.name}:${file.lastModified}:${index}`} file={file} index={index} disabled={disabled}
                onRemove={() => { setSelectionError(''); onChange(files.filter((_, selected) => selected !== index)); }} />)}
        </ul>}
        {message && <p role="alert" className="text-xs font-medium text-red-700">{message}</p>}
    </fieldset>;
}
