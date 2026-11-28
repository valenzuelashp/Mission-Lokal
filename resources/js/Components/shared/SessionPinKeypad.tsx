import { Delete, Eye, EyeOff } from 'lucide-react';

type Props = {
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    onToggle: () => void;
    disabled?: boolean;
    invalid?: boolean;
};

export default function SessionPinKeypad({ value, onChange, visible, onToggle, disabled = false, invalid = false }: Props) {
    const digit = (number: string) => onChange((value + number).slice(0, 6));
    const keyClass = 'flex h-14 w-14 items-center justify-center justify-self-center rounded-full bg-slate-50 text-xl font-medium text-slate-800 ring-1 ring-slate-100 transition-colors hover:bg-blue-50 hover:text-blue-700 active:bg-blue-700 active:text-white focus-visible:outline-blue-600 disabled:cursor-default disabled:opacity-40 dark:ring-slate-700';

    return <div>
        <label htmlFor="session-pin" className="sr-only">Six-digit PIN</label>
        <div className="relative mx-auto max-w-[18rem] rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-4">
            {/* One real input keeps typing, paste, keyboard submission and assistive technology working. */}
            <input id="session-pin" name="pin" type="password" inputMode="none" autoComplete="off" autoFocus
                required pattern="[0-9]{6}" minLength={6} maxLength={6} disabled={disabled}
                aria-invalid={invalid || undefined} aria-describedby={invalid ? 'session-pin-error' : undefined}
                value={value} onChange={event => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" />
            <div aria-hidden="true" className="pointer-events-none grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }, (_, index) => <span key={index}
                    className={`flex h-12 items-center justify-center rounded-xl border text-xl font-semibold ${invalid ? 'border-red-300 bg-red-50 text-red-700' : value[index] ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-300'}`}>
                    {value[index] ? visible ? value[index] : '\u2022' : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                </span>)}
            </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">Enter all six digits to unlock automatically.</p>
        <div className="mx-auto mt-6 grid max-w-[17rem] grid-cols-3 gap-x-6 gap-y-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(number => <button key={number} type="button"
                disabled={disabled || value.length === 6} onClick={() => digit(number)} className={keyClass}>{number}</button>)}
            <button type="button" disabled={disabled} onClick={onToggle} aria-label={`${visible ? 'Hide' : 'Show'} PIN`}
                aria-pressed={visible} aria-controls="session-pin" title={`${visible ? 'Hide' : 'Show'} PIN`} className={keyClass}>
                {visible ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button type="button" disabled={disabled || value.length === 6} onClick={() => digit('0')} className={keyClass}>0</button>
            <button type="button" disabled={disabled || !value} onClick={() => onChange(value.slice(0, -1))}
                aria-label="Delete last digit" title="Delete last digit" className={keyClass}><Delete className="h-5 w-5" aria-hidden="true" /></button>
        </div>
    </div>;
}
