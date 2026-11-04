import { KeyboardEvent, useRef } from 'react';
import { cn } from '@/Lib/utils';

type Props = {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    label?: string;
    error?: string;
    className?: string;
};

export default function OtpInput({ value, onChange, length = 6, label = 'Verification code', error, className }: Props) {
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const digits = Array.from({ length }, (_, index) => value[index] ?? '');

    const updateDigit = (index: number, digit: string) => {
        const cleanDigit = digit.replace(/\D/g, '').slice(-1);
        const next = digits.slice();
        next[index] = cleanDigit;
        onChange(next.join('').replace(/\s/g, '').slice(0, length));
        if (cleanDigit && index < length - 1) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <fieldset className={cn('space-y-2', className)}>
            <legend className="mb-2 block text-center text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">{label}</legend>
            <div className="flex justify-center gap-2" role="group" aria-label={label}>
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(element) => { inputs.current[index] = element; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        value={digit}
                        onChange={(event) => updateDigit(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={(event) => {
                            const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
                            if (pasted) {
                                event.preventDefault();
                                onChange(pasted.padEnd(length, '').slice(0, length));
                                inputs.current[Math.min(pasted.length, length - 1)]?.focus();
                            }
                        }}
                        aria-label={`${label} digit ${index + 1}`}
                        className="h-12 w-11 rounded-xl border border-slate-300 bg-white text-center font-mono text-xl font-black text-slate-900 shadow-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:w-12"
                    />
                ))}
            </div>
            {error && <p className="text-center text-xs font-semibold text-red-600">{error}</p>}
        </fieldset>
    );
}
