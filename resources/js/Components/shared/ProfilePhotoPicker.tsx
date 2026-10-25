import { router } from '@inertiajs/react';
import { Camera } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import UserAvatar from '@/Components/shared/UserAvatar';
import { useAuth } from '@/Hooks/usePageProps';
import { cn } from '@/Lib/utils';

type Props = {
    className?: string;
    avatarClassName?: string;
    fallback?: string;
};

export default function ProfilePhotoPicker({ className, avatarClassName, fallback = '?' }: Props) {
    const { user } = useAuth();
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const photoUrl = user?.profile_photo_url ?? null;
    const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ');

    const choose = () => inputRef.current?.click();

    const onFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }

        setError(null);
        setBusy(true);
        router.post('/profile-photo', { photo: file }, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => setError(errors.photo ?? 'Could not save that picture.'),
            onFinish: () => setBusy(false),
        });
    };

    const remove = () => {
        setError(null);
        setBusy(true);
        router.delete('/profile-photo', {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className={cn('flex min-w-0 items-center gap-3', className)}>
            <button
                type="button"
                onClick={choose}
                disabled={busy}
                className="relative shrink-0 cursor-pointer disabled:cursor-wait"
                aria-label={photoUrl ? 'Change profile picture' : 'Add profile picture'}
            >
                <UserAvatar
                    src={photoUrl}
                    name={name}
                    fallback={fallback}
                    className={avatarClassName}
                />
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-slate-900 text-white">
                    <Camera className="h-3 w-3" />
                </span>
            </button>
            <div className="min-w-0">
                <button
                    type="button"
                    onClick={choose}
                    disabled={busy}
                    className="block truncate text-left text-xs font-black text-sky-700 hover:underline disabled:cursor-wait"
                >
                    {busy ? 'Saving…' : photoUrl ? 'Change profile picture' : 'Add profile picture'}
                </button>
                {photoUrl && (
                    <button
                        type="button"
                        onClick={remove}
                        disabled={busy}
                        className="mt-0.5 block text-left text-[11px] font-semibold text-slate-500 hover:text-rose-600 disabled:cursor-wait"
                    >
                        Remove
                    </button>
                )}
                {error && <p className="mt-1 text-[11px] font-semibold text-rose-600">{error}</p>}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onFile}
            />
        </div>
    );
}
