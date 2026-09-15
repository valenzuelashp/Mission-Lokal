import { useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { MAP_BASEMAPS, type MapBasemapId } from '@/Lib/mapUtils';
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
    } catch {
        // Ignore private-mode storage errors.
    }

    return fallback;
}

export function useMapBasemap(defaultId: MapBasemapId = 'streets') {
    const [basemap, setBasemapState] = useState<MapBasemapId>(() => readStoredBasemap(defaultId));

    const setBasemap = (id: MapBasemapId) => {
        setBasemapState(id);
        try {
            window.localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // Ignore private-mode storage errors.
        }
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
    return (
        <div
            className={cn(
                'absolute left-16 top-3 z-[500] flex max-w-[calc(100%-5rem)] flex-wrap rounded-md border border-slate-200 bg-white/95 shadow-md backdrop-blur-sm',
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
                        'px-2.5 py-1.5 text-xs font-medium transition-colors',
                        value === layer.id
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-600 hover:bg-slate-100',
                    )}
                >
                    {layer.label}
                </button>
            ))}
        </div>
    );
}
