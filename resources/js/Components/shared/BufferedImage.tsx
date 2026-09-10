import { ImgHTMLAttributes, useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/Lib/utils';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> & {
    imgClassName?: string;
};

export default function BufferedImage({ className, imgClassName, alt = '', src, ...props }: Props) {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        setStatus('loading');
    }, [src]);

    return (
        <div className={cn('relative overflow-hidden bg-slate-100', className)}>
            {status !== 'ready' && (
                <div className="pointer-events-none absolute inset-0 media-shimmer" aria-hidden />
            )}
            {status === 'error' ? (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
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
