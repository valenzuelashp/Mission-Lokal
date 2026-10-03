import { ImgHTMLAttributes, useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> & {
    imgClassName?: string;
};

export default function BufferedImage({ className, imgClassName, alt = '', src, ...props }: Props) {
    const theme = useResidentTheme();
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        setStatus('loading');
    }, [src]);

    return (
        <div className={cn('relative overflow-hidden rounded-xl border', theme.cardBorder, theme.inputBg, className)}>
            {status !== 'ready' && (
                <div className={cn('pointer-events-none absolute inset-0 animate-pulse opacity-40', theme.primaryBg)} aria-hidden />
            )}
            {status === 'error' ? (
                <div className={`absolute inset-0 flex items-center justify-center ${theme.textMuted}`}>
                    <ImageOff className="h-6 w-6" />
                </div>
            ) : (
                <img
                    {...props}
                    src={src}
                    alt={alt}
                    onLoad={() => setStatus('ready')}
                    onError={() => setStatus('error')}
                    ref={(image) => {
                        if (image?.complete && image.naturalWidth > 0) {
                            setStatus('ready');
                        }
                    }}
                    className={cn(
                        'h-full w-full object-cover transition-opacity duration-300',
                        status === 'ready' ? 'opacity-100' : 'opacity-0',
                        imgClassName,
                    )}
                />
            )}
            {status === 'loading' && <span className="sr-only">Loading photo</span>}
        </div>
    );
}