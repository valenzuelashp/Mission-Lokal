import { useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { MAP_BASEMAPS, type MapBasemapId } from '@/Lib/mapUtils';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const STORAGE_KEY = 'mission-lokal-map-basemap';

function readStoredBasemap(fallback: MapBasemapId): MapBasemapId {
    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved && saved in MAP_BASEMAPS) {
            return saved as MapBasemapId;
        }
    } catch {}

    return fallback;
}

export function useMapBasemap(defaultId: MapBasemapId = 'streets') {
    const [basemap, setBasemapState] = useState<MapBasemapId>(() => readStoredBasemap(defaultId));

    const setBasemap = (id: MapBasemapId) => {
        setBasemapState(id);
        try {
            window.localStorage.setItem(STORAGE_KEY, id);
        } catch {}
    };

    return { basemap, setBasemap, layer: MAP_BASEMAPS[basemap] };
}

export function MapBasemapTiles({ basemap }: { basemap: MapBasemapId }) {
    const layer = MAP_BASEMAPS[basemap];

    return (
        <>
            <TileLayer
                key={layer.id}
                attribution={layer.attribution}
                url={layer.url}
                maxZoom={layer.maxZoom}
            />
            {layer.overlays?.map((overlayUrl) => (
                <TileLayer
                    key={`${layer.id}-${overlayUrl}`}
                    url={overlayUrl}
                    pane="overlayPane"
                    maxZoom={layer.maxZoom}
                />
            ))}
        </>
    );
}

type ToggleProps = {
    value: MapBasemapId;
    onChange: (id: MapBasemapId) => void;
    className?: string;
};

export function MapBasemapToggle({ value, onChange, className }: ToggleProps) {
    const theme = useResidentTheme();

    return (
        <div
            className={cn(
                `absolute z-[500] flex max-w-[calc(100%-8rem)] flex-wrap rounded-xl border ${theme.cardBorder} bg-white/95 shadow-md backdrop-blur-md p-1 gap-1`,
                className,
            )}
            role="group"
            aria-label="Map view"
        >
            {(Object.values(MAP_BASEMAPS)).map((layer) => (
                <button
                    key={layer.id}
                    type="button"
                    onClick={() => onChange(layer.id)}
                    className={cn(
                        'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer shadow-2xs',
                        value === layer.id
                            ? `${theme.primaryBg} text-white shadow-xs`
                            : `${theme.textMuted} hover:opacity-100 bg-slate-50`,
                    )}
                >
                    {layer.label}
                </button>
            ))}
        </div>
    );
}