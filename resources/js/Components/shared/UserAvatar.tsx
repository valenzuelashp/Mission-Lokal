import { cn } from '@/Lib/utils';

type Props = {
    src?: string | null;
    name?: string | null;
    fallback?: string;
    className?: string;
};

export default function UserAvatar({ src, name, fallback = '?', className }: Props) {
    const letter = (name?.trim()?.charAt(0) || fallback).toUpperCase();

    return (
        <span className={cn('inline-flex items-center justify-center overflow-hidden', className)}>
            {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : letter}
        </span>
    );
}
