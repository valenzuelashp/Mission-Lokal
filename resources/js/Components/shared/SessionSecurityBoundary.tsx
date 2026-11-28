import { FormEvent, PropsWithChildren, useEffect, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { SessionAwayTimer } from '@/Lib/sessionAwayTimer';
import SessionPinKeypad from '@/Components/shared/SessionPinKeypad';

type SecurityState = { locked: boolean; needs_pin: boolean; version?: number; grace_seconds?: number; away_remaining_seconds?: number | null; context?: string };
export type SessionSecurityAuth = { user?: { id: string; first_name?: string; role?: string }; session_security?: SecurityState | null };

type SecretFieldProps = {
    name: string;
    label: string;
    revealLabel: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggle: () => void;
    autoFocus?: boolean;
    pin?: boolean;
};

function SecretField({ name, label, revealLabel, value, onChange, visible, onToggle, autoFocus = false, pin = false }: SecretFieldProps) {
    const id = `session-${name}`;
    const toggleLabel = `${visible ? 'Hide' : 'Show'} ${revealLabel}`;
    return <div>
        <label htmlFor={id} className="block text-sm font-medium">{label}</label>
        <div className="relative mt-1">
            <input id={id} name={name} autoFocus={autoFocus} type={visible ? 'text' : 'password'}
                autoComplete={pin ? 'off' : 'current-password'} inputMode={pin ? 'numeric' : undefined}
                pattern={pin ? '[0-9]{6}' : undefined} minLength={pin ? 6 : undefined} maxLength={pin ? 6 : undefined}
                required value={value} onChange={event => onChange(pin ? event.target.value.replace(/\D/g, '') : event.target.value)}
                className={`block w-full rounded-xl border border-slate-300 bg-white p-3 pr-12 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 ${pin ? 'text-center text-xl tracking-[0.4em]' : ''}`} />
            <button type="button" onClick={onToggle} aria-label={toggleLabel} title={toggleLabel} aria-controls={id} aria-pressed={visible}
                className="absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
        </div>
    </div>;
}

export default function SessionSecurityBoundary({ children, auth, lockPage = false }: PropsWithChildren<{ auth?: SessionSecurityAuth; lockPage?: boolean }>) {
    const enabled = Boolean(auth?.user && auth.session_security);
    const sessionContext = auth?.session_security?.context ?? 'legacy';
    const sessionKey = `${auth?.user?.id ?? 'guest'}:${sessionContext}`;
    const storageKey = `mission-session-lock:${sessionKey}`;
    const awayKey = `mission-session-away:${sessionKey}`;
    const graceMs = Math.max(0, auth?.session_security?.grace_seconds ?? 120) * 1000;
    const [locked, setLocked] = useState(() => {
        const departure = localStorage.getItem(awayKey);
        const expired = departure !== null && departure.trim() !== '' && Number.isFinite(Number(departure))
            && Number(departure) >= 0 && Date.now() - Number(departure) >= graceMs;
        return enabled && (lockPage || Boolean(auth?.session_security?.locked) || sessionStorage.getItem(storageKey) === 'locked' || expired);
    });
    const [needsPin, setNeedsPin] = useState(Boolean(auth?.session_security?.needs_pin));
    const [resetPin, setResetPin] = useState(false);
    const [pin, setPin] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [pinVisible, setPinVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const content = useRef<HTMLDivElement>(null);
    const dialog = useRef<HTMLDivElement>(null);
    const lockRequest = useRef<Promise<unknown>>(Promise.resolve());
    const localLocked = useRef(locked);
    const latestVersion = useRef(auth?.session_security?.version ?? 0);
    const lockEpoch = useRef(0);
    const stream = useRef<EventSource | null>(null);
    const leaving = useRef(false);
    const submissionInFlight = useRef(false);
    const refocusPin = useRef(false);
    const awayTimerRef = useRef<SessionAwayTimer | null>(null);
    const serverState = auth?.session_security;
    const currentServerState = (serverState?.version ?? 0) >= latestVersion.current;
    const covered = enabled && (locked || needsPin || lockPage || (currentServerState && Boolean(serverState?.locked || serverState?.needs_pin)));

    const clearSecrets = () => {
        refocusPin.current = false;
        setPassword(''); setPin(''); setConfirmation('');
        setPasswordVisible(false); setPinVisible(false); setConfirmationVisible(false);
    };

    const revoke = (login?: string) => {
        if (leaving.current) return;
        leaving.current = true;
        sessionStorage.removeItem(storageKey);
        awayTimerRef.current?.clear();
        window.location.replace(login || (auth?.user?.role === 'resident' ? '/login' : '/admin-personnel/login'));
    };

    useLayoutEffect(() => {
        if (!enabled || !serverState || (serverState.version ?? 0) < latestVersion.current) return;
        latestVersion.current = serverState.version ?? 0;
        setNeedsPin(serverState.needs_pin);
        if (serverState.locked) {
            localLocked.current = true;
            sessionStorage.setItem(storageKey, 'locked');
            setLocked(true);
        }
    }, [enabled, serverState?.locked, serverState?.needs_pin, serverState?.version, storageKey]);

    useLayoutEffect(() => {
        if (content.current) content.current.inert = covered;
        if (!covered) return;
        window.dispatchEvent(new Event('session-security-covered'));
        const previousFocus = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const input = dialog.current?.querySelector<HTMLInputElement>('input');
        if (input) input.focus({ preventScroll: true });
        else dialog.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [covered]);

    useEffect(() => {
        if (busy || !refocusPin.current) return;
        refocusPin.current = false;
        dialog.current?.querySelector<HTMLInputElement>('#session-pin')?.focus({ preventScroll: true });
    }, [busy, pin, error]);

    useEffect(() => {
        if (!enabled) return;
        let mounted = true;
        let checkingStatus = false;
        let presenceRequest = Promise.resolve();
        let resumePending = false;
        const isActive = () => !document.hidden && document.hasFocus();
        const cover = (clearInputs = false) => {
            const newlyLocked = !localLocked.current;
            localLocked.current = true;
            sessionStorage.setItem(storageKey, 'locked');
            if (mounted) {
                setLocked(true);
                // A repeated status/stream update must not erase a form already being filled.
                if (newlyLocked || clearInputs) clearSecrets();
            }
        };
        const postSession = async (action: 'lock' | 'away' | 'resume') => {
            const xsrf = document.cookie.split('; ').find(cookie => cookie.startsWith('XSRF-TOKEN='))?.slice(11);
            const response = await fetch(`/session/${action}`, {
                method: 'POST', credentials: 'same-origin', keepalive: true,
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(xsrf ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrf) } : {}) },
            });
            if (response.status === 401) revoke();
            if (!response.ok) throw new Error('Session update unavailable');
            return response.json();
        };
        const sendLock = () => {
            lockEpoch.current++;
            cover(true);
            lockRequest.current = postSession('lock').catch(() => { /* Stay covered until a PIN is verified online. */ });
        };
        const broadcastLock = () => { localStorage.setItem('mission-session-lock-event', `${sessionKey}:${Date.now()}`); };
        const awayTimer = new SessionAwayTimer({
            storage: localStorage, key: awayKey, graceMs,
            onExpire: () => { if (mounted) { sendLock(); broadcastLock(); } },
        });
        awayTimerRef.current = awayTimer;
        const readState = (state: SecurityState) => {
            if (!mounted) return;
            if ((state.version ?? 0) < latestVersion.current) return;
            latestVersion.current = state.version ?? 0;
            setNeedsPin(state.needs_pin);
            if (state.locked) { awayTimer.dispose(); cover(); }
            else if (state.away_remaining_seconds != null && isActive() && !awayTimer.isAway && !resumePending) {
                queuePresence('resume');
            }
        };
        const queuePresence = (action: 'away' | 'resume') => {
            if (action === 'resume') resumePending = true;
            presenceRequest = presenceRequest.catch(() => {}).then(async () => {
                try {
                    const state = await postSession(action);
                    if (mounted) readState(state);
                } catch { /* The local timer and return check still protect the page while offline. */ }
                finally { if (action === 'resume') resumePending = false; }
            });
        };
        const check = async () => {
            if (checkingStatus) return;
            checkingStatus = true;
            try {
                const { data } = await axios.get('/session/status');
                if (!data || typeof data.locked !== 'boolean' || typeof data.needs_pin !== 'boolean') throw new Error('Invalid session status response');
                readState(data);
                if (data.stream_enabled && !stream.current) {
                    stream.current = new EventSource('/session/events');
                    stream.current.onmessage = event => {
                        try { const state = JSON.parse(event.data); if (state.revoked) revoke(); else readState(state); } catch { /* Retry with the next heartbeat. */ }
                    };
                    stream.current.onerror = () => { /* Heartbeat and focus checks remain active. */ };
                }
            } catch (exception: any) {
                if (!mounted) return;
                if (exception.response?.status === 401) revoke(exception.response.data?.login_url);
                else if (localLocked.current) setError('Reconnect to verify your session and unlock.');
            } finally { checkingStatus = false; }
        };
        const onAway = () => {
            setPasswordVisible(false); setPinVisible(false); setConfirmationVisible(false);
            if (awayTimer.start()) queuePresence('away');
        };
        const onReturn = () => {
            if (!isActive()) return;
            if (awayTimer.resume() && !localLocked.current && !resumePending) queuePresence('resume');
            void check();
        };
        const visibility = () => { if (document.hidden) onAway(); else onReturn(); };
        const onStorage = (event: StorageEvent) => {
            if (event.key === awayKey) { if (isActive()) onReturn(); else awayTimer.sync(); }
            if (event.key === 'mission-session-lock-event' && event.newValue?.startsWith(`${sessionKey}:`)) { cover(true); void check(); }
        };
        const lockImmediately = () => { awayTimer.dispose(); sendLock(); broadcastLock(); };
        const onBlocked = () => { cover(); void check(); };
        const onRevoked = () => revoke();
        document.addEventListener('visibilitychange', visibility);
        window.addEventListener('blur', onAway);
        window.addEventListener('focus', onReturn);
        window.addEventListener('online', onReturn);
        window.addEventListener('pageshow', onReturn);
        window.addEventListener('storage', onStorage);
        window.addEventListener('session-locked', onBlocked);
        window.addEventListener('session-revoked', onRevoked);
        window.addEventListener('session-lock-request', lockImmediately);
        if (lockPage || localLocked.current) sendLock();
        if (isActive()) onReturn(); else onAway();
        void check();
        const heartbeat = window.setInterval(() => {
            if (isActive() && awayTimer.isAway && !localLocked.current) onReturn();
            else void check();
        }, 3000);
        return () => {
            mounted = false;
            clearInterval(heartbeat);
            awayTimer.dispose();
            if (awayTimerRef.current === awayTimer) awayTimerRef.current = null;
            stream.current?.close(); stream.current = null;
            document.removeEventListener('visibilitychange', visibility);
            window.removeEventListener('blur', onAway);
            window.removeEventListener('focus', onReturn);
            window.removeEventListener('online', onReturn);
            window.removeEventListener('pageshow', onReturn);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('session-locked', onBlocked);
            window.removeEventListener('session-revoked', onRevoked);
            window.removeEventListener('session-lock-request', lockImmediately);
        };
    }, [enabled, sessionKey, graceMs, lockPage]);

    const submit = async (event?: FormEvent, enteredPin = pin) => {
        event?.preventDefault();
        if (submissionInFlight.current) return;
        submissionInFlight.current = true;
        setBusy(true); setError('');
        try {
            await lockRequest.current;
            const submittedEpoch = lockEpoch.current;
            const { data } = needsPin || resetPin
                ? await axios.put('/session/pin', { current_password: password, pin, pin_confirmation: confirmation })
                : await axios.post('/session/unlock', { pin: enteredPin });
            const stale = (data.version ?? 0) < latestVersion.current;
            latestVersion.current = Math.max(latestVersion.current, data.version ?? 0);
            if (stale || lockEpoch.current !== submittedEpoch || data.locked) {
                clearSecrets(); setError('The session was locked again. Enter your PIN to continue.');
                return;
            }
            sessionStorage.removeItem(storageKey);
            awayTimerRef.current?.clear();
            localLocked.current = false;
            clearSecrets(); setLocked(false); setNeedsPin(false); setResetPin(false);
            if (lockPage) window.location.replace(data.return_url || '/');
        } catch (exception: any) {
            if (exception.response?.status === 401) revoke(exception.response.data?.login_url);
            const errors = exception.response?.data?.errors;
            if (!needsPin && !resetPin && exception.response?.status === 422 && errors?.pin) {
                setPin(''); setPinVisible(false); refocusPin.current = true;
            }
            const retryAfter = Number(exception.response?.headers?.['retry-after']);
            const limitedMessage = `${needsPin || resetPin ? 'PIN setup' : 'PIN unlocking'} is temporarily limited. ${Number.isFinite(retryAfter) && retryAfter > 0 ? `Try again in ${Math.ceil(retryAfter)} seconds.` : 'Please wait a moment before trying again.'}`;
            setError(errors ? Object.values(errors).flat().join(' ') : exception.response?.status === 429 ? limitedMessage : 'Unable to unlock. Check your connection and retry.');
        } finally { submissionInFlight.current = false; setBusy(false); }
    };

    const changeUnlockPin = (value: string) => {
        if (submissionInFlight.current) return;
        setPin(value); setError('');
        // Submit only on a completed entry, so failed/offline requests never retry themselves.
        if (/^\d{6}$/.test(value)) void submit(undefined, value);
    };

    return <>
        <div ref={content} aria-hidden={covered || undefined} style={covered ? { visibility: 'hidden' } : undefined}>{children}</div>
        {covered && <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="session-lock-title" aria-describedby="session-lock-description" onKeyDown={event => {
            if (event.key !== 'Tab') return;
            const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled])') || []);
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus(); }
        }} className="fixed inset-0 z-[100000] flex items-center justify-center overflow-y-auto overscroll-contain bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-0 text-slate-900 outline-none dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:p-6">
            <div className="my-auto min-h-[100dvh] w-full bg-white px-6 py-7 sm:min-h-0 sm:max-w-md sm:rounded-3xl sm:border sm:border-slate-200 sm:p-8 sm:shadow-xl sm:shadow-slate-900/10">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-slate-800">
                    <img src="/images/mission-lokal-logo.png" alt="" className="h-8 w-8 object-contain" />
                    Mission-Lokal
                </div>
                <div className="mx-auto mb-4 mt-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
                    <LockKeyhole className="h-7 w-7" aria-hidden="true" />
                </div>
                <h1 id="session-lock-title" className="text-center text-2xl font-bold tracking-tight">{needsPin ? 'Set your session PIN' : resetPin ? 'Reset your PIN' : 'Enter your PIN'}</h1>
                <p id="session-lock-description" className="mx-auto mt-2 max-w-[17rem] text-center text-sm leading-relaxed text-slate-600">{needsPin || resetPin ? 'Choose a six-digit PIN to keep your account secure after a longer break.' : `Welcome back${auth?.user?.first_name ? `, ${auth.user.first_name}` : ''}. Unlock to pick up where you left off.`}</p>
                <form onSubmit={submit} aria-busy={busy} className="mt-6 space-y-4">
                    {(needsPin || resetPin) && <SecretField name="current_password" label="Current password" revealLabel="current password" autoFocus value={password} onChange={setPassword} visible={passwordVisible} onToggle={() => setPasswordVisible(!passwordVisible)} />}
                    {needsPin || resetPin
                        ? <SecretField name="pin" label="New six-digit PIN" revealLabel="PIN" pin value={pin} onChange={setPin} visible={pinVisible} onToggle={() => setPinVisible(!pinVisible)} />
                        : <SessionPinKeypad value={pin} onChange={changeUnlockPin} visible={pinVisible} onToggle={() => setPinVisible(!pinVisible)} disabled={busy} invalid={Boolean(error)} />}
                    {(needsPin || resetPin) && <SecretField name="pin_confirmation" label="Confirm PIN" revealLabel="PIN confirmation" pin value={confirmation} onChange={setConfirmation} visible={confirmationVisible} onToggle={() => setConfirmationVisible(!confirmationVisible)} />}
                    {error && <p id="session-pin-error" role="alert" className="text-center text-sm text-red-700">{error}</p>}
                    <button disabled={busy || (!needsPin && !resetPin && pin.length !== 6)} className="w-full rounded-xl bg-blue-700 p-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-default disabled:opacity-50">{busy ? 'Verifying…' : needsPin || resetPin ? 'Save PIN and continue' : 'Unlock'}</button>
                    {!needsPin && <button type="button" disabled={busy} onClick={() => { setResetPin(!resetPin); setError(''); clearSecrets(); }} className="block w-full text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">{resetPin ? 'Use my PIN' : 'Forgot or change PIN?'}</button>}
                </form>
                <button type="button" disabled={busy} onClick={() => axios.post('/logout').then(() => revoke()).catch(() => revoke())} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-800">Sign out</button>
                <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                    <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />Your session stays secure. Your work stays here.</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{graceMs > 0 ? `PIN required after ${Math.ceil(graceMs / 60000)} ${graceMs <= 60000 ? 'minute' : 'minutes'} away.` : 'PIN required when you leave this tab.'}</p>
                </div>
            </div>
        </div>}
    </>;
}
