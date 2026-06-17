import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapInvalidateSize() {
    const map = useMap();

    useEffect(() => {
        const invalidate = () => map.invalidateSize();

        invalidate();
        const t = setTimeout(invalidate, 200);

        window.addEventListener('resize', invalidate);

        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', invalidate);
        };
    }, [map]);

    return null;
}
