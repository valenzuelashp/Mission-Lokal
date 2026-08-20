import { Link } from '@inertiajs/react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { createPinIcon, severityColors } from '@/Lib/mapUtils';
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

export default function AdminOperationMap({ pins, center = [14.5995, 120.9842], className = 'h-80' }: Props) {
    return (
        <div className={cn('flex flex-col', className)}>
            <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live operation area</h3>
                <div className="flex items-center gap-3">
                    <Link href="/admin/map" className="text-xs font-medium text-blue-700 hover:underline">
                        Open full map
                    </Link>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        Live pins
                    </span>
                </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border">
                <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
                    <MapInvalidateSize />
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                                    <div className="text-sm">
                                        <p className="font-semibold">{pin.title}</p>
                                        <p className="mt-1 capitalize text-muted-foreground">{severity} severity</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1.5 text-[10px] text-white">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                        {legendLevels.map((level) => (
                            <span key={level} className="flex items-center gap-1 capitalize">
                                <span
                                    className="inline-block h-2 w-2 rounded-full"
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
