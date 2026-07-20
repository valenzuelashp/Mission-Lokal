import { Link } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { cn } from '@/Lib/utils';
import type { MapPin } from '@/Types';

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

export default function AdminOperationMap({ pins, center = [14.5995, 120.9842], className = 'h-80' }: Props) {
    return (
        <div className={cn('flex flex-col', className)}>
            <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2 px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">Live operational theater</h3>
                <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider">
                    <Link href="/admin/map" className="text-neutral-900 border-b border-neutral-900/30 pb-0.5 hover:border-neutral-900 transition-colors">
                        Expand Map view
                    </Link>
                    <span className="flex items-center gap-1.5 text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/40">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-950" />
                        Live sync
                    </span>
                </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-neutral-200/60 bg-neutral-900 shadow-sm z-10">
                <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
                    <MapInvalidateSize />
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {pins.map((pin) => (
                        <Marker key={pin.id} position={[pin.lat, pin.lng]} />
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}