type AwayStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type TimerOptions = {
    storage: AwayStorage;
    key: string;
    graceMs: number;
    onExpire: () => void;
    now?: () => number;
    schedule?: (callback: () => void, delay: number) => unknown;
    cancel?: (handle: unknown) => void;
};

/** Keeps the original departure time, including across reloads and other portal tabs. */
export class SessionAwayTimer {
    private timer: unknown = null;
    private expired = false;
    private readonly now: () => number;
    private readonly schedule: NonNullable<TimerOptions['schedule']>;
    private readonly cancel: NonNullable<TimerOptions['cancel']>;

    constructor(private readonly options: TimerOptions) {
        this.now = options.now ?? Date.now;
        this.schedule = options.schedule ?? ((callback, delay) => setTimeout(callback, delay));
        this.cancel = options.cancel ?? (handle => clearTimeout(handle as ReturnType<typeof setTimeout>));
    }

    get isAway(): boolean {
        return this.departedAt() !== null;
    }

    start(): boolean {
        const started = !this.isAway;
        if (started) {
            this.expired = false;
            this.options.storage.setItem(this.options.key, String(this.now()));
        }
        this.sync();
        return started;
    }

    sync(): void {
        this.dispose();
        const departure = this.departedAt();
        if (departure === null) { this.expired = false; return; }
        const remaining = this.options.graceMs - (this.now() - departure);
        if (remaining <= 0) {
            if (!this.expired) { this.expired = true; this.options.onExpire(); }
            return;
        }
        this.timer = this.schedule(() => { this.timer = null; this.sync(); }, remaining);
    }

    resume(): boolean {
        const departure = this.departedAt();
        if (departure !== null && this.now() - departure >= this.options.graceMs) {
            this.sync();
            return false;
        }
        this.clear();
        return true;
    }

    clear(): void {
        this.dispose();
        this.expired = false;
        this.options.storage.removeItem(this.options.key);
    }

    dispose(): void {
        if (this.timer !== null) this.cancel(this.timer);
        this.timer = null;
    }

    private departedAt(): number | null {
        const stored = this.options.storage.getItem(this.options.key);
        if (stored === null) return null;
        const value = Number(stored);
        return stored.trim() !== '' && Number.isFinite(value) && value >= 0 ? value : null;
    }
}
