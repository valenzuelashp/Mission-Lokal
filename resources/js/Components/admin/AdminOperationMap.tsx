import { Link } from '@inertiajs/react';
import { MapContainer, Marker, Polygon, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { MapBasemapTiles, MapBasemapToggle, useMapBasemap } from '@/Components/maps/MapBasemap';
import { createPinIcon, severityColors, TAMBO_CENTER, TAMBO_MASK_STYLE, tamboMaskPositions } from '@/Lib/mapUtils';
import { cn } from '@/Lib/utils';
import type { MapPin, Severity } from '@/Types';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

type Props = {
    pins: MapPin[];
    center?: [number, number];
    className?: string;
};

const legendLevels: Severity[] = ['critical', 'high', 'medium', 'low'];

export default function AdminOperationMap({ pins, center = TAMBO_CENTER, className = 'h-80' }: Props) {
    const { basemap, setBasemap } = useMapBasemap();
    return (
        <div className={cn('flex flex-col', className)}>
            <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Live Municipal Operations</h3>
                <div className="flex items-center gap-3">
                    <Link href="/admin/map" className="text-xs font-bold text-blue-700 hover:underline">
                        Open Full Radar →
                    </Link>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        Live Vector Feed
                    </span>
                </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full z-0">
                    <MapInvalidateSize />
                    <MapBasemapTiles basemap={basemap} />
                    <Polygon
                        positions={tamboMaskPositions()}
                        pathOptions={TAMBO_MASK_STYLE}
                        interactive={false}
                    />
                    {pins.map((pin) => {
                        const severity = (pin.severity ?? 'medium') as Severity;
                        return (
                            <Marker
                                key={pin.id}
                                position={[pin.lat, pin.lng]}
                                icon={createPinIcon(severity)}
                            >
                                <Popup>
                                    <div className="text-sm p-1">
                                        <p className="font-bold text-slate-900">{pin.title}</p>
                                        <p className="mt-0.5 capitalize text-xs text-slate-500 font-semibold">{severity} severity</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                <MapBasemapToggle value={basemap} onChange={setBasemap} />
                <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[10px] text-slate-700 shadow-md backdrop-blur-xs">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {legendLevels.map((level) => (
                            <span key={level} className="flex items-center gap-1.5 capitalize font-semibold">
                                <span
                                    className="inline-block h-2 w-2 rounded-full shadow-2xs"
                                    style={{ background: severityColors[level] }}
                                />
                                {level}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}