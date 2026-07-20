import { Link } from '@inertiajs/react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { createPinIcon, hotspotColors } from '@/Lib/mapUtils';
import type { AdminMapHotspot, AdminMapPin } from '@/Types';

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
    pins: AdminMapPin[];
    hotspots: AdminMapHotspot[];
    showHotspots: boolean;
    selectedId: string | null;
    onSelect: (id: string) => void;
    center?: [number, number];
    className?: string;
};

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo([lat, lng], 15, { duration: 0.6 });
    }, [lat, lng, map]);

    return null;
}

export default function AdminFullMap({
    pins,
    hotspots,
    showHotspots,
    selectedId,
    onSelect,
    center = [14.5995, 120.9842],
    className = 'h-[50vh] min-h-[280px] lg:h-full',
}: Props) {
    const selected = pins.find((p) => p.id === selectedId);

    return (
        <div className={className}>
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-neutral-200/60 bg-neutral-900 shadow-md">
                <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full z-10">
                    <MapInvalidateSize />
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {showHotspots &&
                        hotspots.map((spot) => (
                            <Circle
                                key={spot.id}
                                center={[spot.lat, spot.lng]}
                                radius={spot.radius_m}
                                pathOptions={{
                                    color: hotspotColors[spot.risk_level],
                                    fillColor: hotspotColors[spot.risk_level],
                                    fillOpacity: 0.12,
                                    weight: 1.5,
                                    opacity: 0.5,
                                }}
                            >
                                <Popup>
                                    <div className="p-1 space-y-1 font-sans text-xs text-neutral-800">
                                        <p className="font-black tracking-tight text-neutral-900">{spot.label}</p>
                                        <p className="font-medium text-neutral-400 uppercase tracking-wider text-[9px] tabular-nums">
                                            {spot.report_count} reports · {spot.risk_level} risk
                                        </p>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}
                    {pins.map((pin) => (
                        <Marker
                            key={pin.id}
                            position={[pin.lat, pin.lng]}
                            icon={createPinIcon(pin.severity ?? 'medium', pin.id === selectedId)}
                            eventHandlers={{ click: () => onSelect(pin.id) }}
                        >
                            <Popup>
                                <div className="min-w-[220px] p-1 space-y-3 font-sans text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-black tracking-tight text-neutral-900">{pin.incident_type}</p>
                                        <p className="font-medium text-neutral-400 text-[10px] leading-tight">{pin.location_label}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider border-neutral-200 text-neutral-500 bg-neutral-50">
                                            {pin.severity}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider border-neutral-200 text-neutral-500 bg-neutral-50">
                                            {pin.status}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className="rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider bg-neutral-900 text-white border-transparent shadow-xs">
                                                Active Operations
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-0.5 border-t border-neutral-100">
                                        <Button size="sm" variant="outline" className="h-7 rounded-lg text-[10px] font-black uppercase tracking-wider flex-1 border-neutral-200 hover:bg-neutral-50" asChild>
                                            <Link href={`/admin/reports/${pin.concern_id}`}>Inspect Report</Link>
                                        </Button>
                                        {pin.mission_id && (
                                            <Button size="sm" className="h-7 rounded-lg text-[10px] font-black uppercase tracking-wider flex-1 bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs" asChild>
                                                <Link href={`/admin/missions/${pin.mission_id.replace('#', '')}`}>
                                                    Mission Track
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {selected && <FlyTo lat={selected.lat} lng={selected.lng} />}
                </MapContainer>
                
                {/* Overlay Indicators */}
                <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-xl border border-neutral-800 bg-neutral-950/95 p-3.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 shadow-md backdrop-blur-md">
                    <p className="text-white tracking-wider tabular-nums">{pins.length} telemetry pins live</p>
                    {showHotspots && <p className="text-neutral-500 mt-1 tabular-nums">{hotspots.length} risk vectors mapped</p>}
                </div>
                
                <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-xl border border-neutral-800 bg-neutral-950/95 p-3.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 shadow-md backdrop-blur-md">
                    <p className="mb-2 text-white tracking-wider text-[10px]">Severity Key</p>
                    <div className="flex flex-col gap-2 font-bold tracking-widest">
                        {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                            <span key={level} className="flex items-center gap-2">
                                <span
                                    className="inline-block h-1.5 w-1.5 rounded-full ring-4 ring-black/40"
                                    style={{
                                        background:
                                            level === 'critical'
                                                ? '#e11d48'
                                                : level === 'high'
                                                  ? '#f97316'
                                                  : level === 'medium'
                                                    ? '#eab308'
                                                    : '#22c55e',
                                    }}
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