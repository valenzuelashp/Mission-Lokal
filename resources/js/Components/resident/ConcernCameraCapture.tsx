import { Camera, RefreshCw, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { captureConcernPhoto, concernCameraError } from '@/Lib/concernPhotos';

type Props = { onCapture: (file: File) => void; onClose: () => void; onUpload: () => void };

export default function ConcernCameraCapture({ onCapture, onClose, onUpload }: Props) {
    const theme = useResidentTheme();
    const id = useId();
    const panel = useRef<HTMLElement>(null);
    const video = useRef<HTMLVideoElement>(null);
    const close = useRef(onClose);
    close.current = onClose;
    const mounted = useRef(false);
    const stop = useRef<() => void>(() => {});
    const captureInFlight = useRef(false);
    const [attempt, setAttempt] = useState(0);
    const [ready, setReady] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        mounted.current = true;
        const previousFocus = document.activeElement as HTMLElement | null;
        panel.current?.scrollIntoView({ block: 'nearest' });
        panel.current?.focus({ preventScroll: true });
        const onHidden = () => { if (document.hidden) { stop.current(); close.current(); } };
        const onLeave = () => { stop.current(); close.current(); };
        document.addEventListener('visibilitychange', onHidden);
        const events = ['pagehide', 'session-locked', 'session-lock-request', 'session-revoked', 'session-security-covered'];
        events.forEach(event => window.addEventListener(event, onLeave));
        return () => {
            mounted.current = false;
            stop.current();
            document.removeEventListener('visibilitychange', onHidden);
            events.forEach(event => window.removeEventListener(event, onLeave));
            if (!document.hidden && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, []);

    useEffect(() => {
        if (!photo) { setPhotoUrl(''); return; }
        const url = URL.createObjectURL(photo);
        setPhotoUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [photo]);

    useEffect(() => {
        if (photo) return;
        let cancelled = false;
        let source: MediaStream | null = null;
        const element = video.current;
        const release = () => {
            cancelled = true;
            source?.getTracks().forEach(track => track.stop());
            if (element) element.srcObject = null;
        };
        stop.current = release;
        setReady(false); setError('');
        const start = async () => {
            if (!window.isSecureContext) { setError('Live camera access needs a secure connection. Open the portal over HTTPS, or upload a photo instead.'); return; }
            if (!navigator.mediaDevices?.getUserMedia) { setError('This browser does not support a live camera preview. Use Upload photos instead.'); return; }
            try {
                source = await navigator.mediaDevices.getUserMedia({ audio: false, video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } });
                // Permission can resolve after the form closes or the resident leaves the tab.
                if (cancelled || document.hidden || !element) { release(); return; }
                const ended = () => {
                    if (cancelled) return;
                    release(); setReady(false); setError('The camera disconnected. Reconnect it and try again, or upload a photo instead.');
                };
                source.getVideoTracks().forEach(track => track.addEventListener('ended', ended, { once: true }));
                element.srcObject = source;
                await element.play();
                if (!cancelled && element.readyState >= 2) setReady(true);
            } catch (exception) {
                if (cancelled) return;
                release(); setError(concernCameraError(exception));
            }
        };
        void start();
        return release;
    }, [attempt, photo]);

    const capture = async () => {
        if (!video.current || !ready || captureInFlight.current) return;
        captureInFlight.current = true; setCapturing(true); setError('');
        try {
            const captured = await captureConcernPhoto(video.current);
            if (mounted.current) { stop.current(); setReady(false); setPhoto(captured); }
        } catch (exception) {
            if (mounted.current) setError(exception instanceof Error ? exception.message : 'The photo could not be captured. Please try again.');
        } finally {
            captureInFlight.current = false;
            if (mounted.current) setCapturing(false);
        }
    };

    return <section ref={panel} tabIndex={-1} aria-labelledby={`${id}-title`} onKeyDown={event => {
        if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    }} className={`space-y-3 rounded-2xl border p-3 outline-none sm:p-4 ${theme.cardBorder} ${theme.accentSurface}`}>
        <div className="flex items-center justify-between gap-3">
            <h3 id={`${id}-title`} className={`text-sm font-bold ${theme.textMain}`}>{photo ? 'Review your photo' : 'Camera preview'}</h3>
            <button type="button" onClick={onClose} aria-label="Close camera" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-slate-900">
            {photo ? <img src={photoUrl || undefined} alt="Captured concern photo" className="aspect-video max-h-80 w-full object-contain" />
                : <video ref={video} autoPlay muted playsInline aria-label="Live camera preview" onCanPlay={() => { if (!error && video.current?.srcObject) setReady(true); }}
                    className="aspect-video max-h-80 w-full object-contain" />}
            {!photo && !ready && <p role="status" className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-white">{error ? 'Camera preview unavailable' : 'Starting camera...'}</p>}
        </div>
        {error && <p role="alert" className="text-xs leading-relaxed text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-2">
            {photo ? <>
                <Button type="button" onClick={() => { onCapture(photo); onClose(); }}><Camera className="h-4 w-4" aria-hidden="true" />Use photo</Button>
                <Button type="button" variant="outline" onClick={() => { setPhoto(null); setError(''); }}><RefreshCw className="h-4 w-4" aria-hidden="true" />Retake</Button>
            </> : error ? <Button type="button" variant="outline" disabled={capturing} onClick={() => setAttempt(value => value + 1)}>Try again</Button>
                : <Button type="button" disabled={!ready || capturing} onClick={capture}><Camera className="h-4 w-4" aria-hidden="true" />{capturing ? 'Capturing...' : 'Capture photo'}</Button>}
            <Button type="button" variant="ghost" onClick={onUpload}>Upload photos instead</Button>
        </div>
        <p className={`text-xs leading-relaxed ${theme.textMuted}`}>{photo ? 'Use this photo to attach it to your concern, or retake it.' : 'Position the concern in the frame, then capture a photo. Audio is off.'}</p>
    </section>;
}
