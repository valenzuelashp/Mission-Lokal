export const MAX_CONCERN_PHOTOS = 4;
export const MAX_CONCERN_PHOTO_BYTES = 4 * 1024 * 1024;

export function prefersNativeConcernCamera(device: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>): boolean {
    return /Android|iPhone|iPad|iPod/i.test(device.userAgent)
        || (/Mac/i.test(device.platform) && device.maxTouchPoints > 1);
}

export function concernCameraError(error: unknown): string {
    const name = error && typeof error === 'object' && 'name' in error ? error.name : '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'Camera access was not allowed. Allow camera access in your browser settings, then try again, or upload a photo instead.';
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'No camera was found. Connect or enable your webcam, then try again, or upload a photo instead.';
    if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return 'Your camera is unavailable. Close other apps using it, then try again, or upload a photo instead.';
    return 'The camera could not start. Check your camera and browser permissions, then try again, or upload a photo instead.';
}

export async function captureConcernPhoto(video: HTMLVideoElement, createCanvas = () => document.createElement('canvas')): Promise<File> {
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) throw new Error('Wait for the camera preview before taking a photo.');
    const canvas = createCanvas();
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photos could not be captured in this browser. Use Upload photos instead.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob || !blob.size) throw new Error('The photo could not be captured. Please try again.');
    if (blob.size > MAX_CONCERN_PHOTO_BYTES) throw new Error('The captured photo is too large. Please retake it or upload a photo under 4 MB.');
    return new File([blob], `concern-camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
}

/** Camera captures and gallery selections share the same attachment rules. The server validates image contents. */
export function appendConcernPhotos(current: File[], incoming: File[], maxFiles = MAX_CONCERN_PHOTOS): { files: File[]; error: string } {
    const files = [...current];
    const errors = new Set<string>();
    for (const file of incoming) {
        const supported = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type.toLowerCase())
            || (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name));
        if (!supported) { errors.add('Use JPG, PNG, or WebP photos.'); continue; }
        if (file.size === 0) { errors.add('One photo is empty. Please take or select it again.'); continue; }
        if (file.size > MAX_CONCERN_PHOTO_BYTES) { errors.add('Each photo must be 4 MB or smaller.'); continue; }
        if (files.length >= Math.max(0, maxFiles)) { errors.add('A concern can contain up to four photos. Remove a selected photo before adding another.'); continue; }
        files.push(file);
    }
    return { files, error: [...errors].join(' ') };
}
