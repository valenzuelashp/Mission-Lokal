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
        map.flyTo([lat, lng], 16, { duration: 0.6 });
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
    className = 'h-[60vh] min-h-[400px] lg:h-full',
}: Props) {
    const selected = pins.find((p) => p.id === selectedId);

    return (
        <div className={className}>
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-xl border bg-slate-900 shadow-sm">
                <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full z-0">
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
                                    fillOpacity: 0.22,
                                    weight: 2,
                                    opacity: 0.8,
                                }}
                            >
                                <Popup>
                                    <div className="text-sm p-1">
                                        <p className="font-semibold text-slate-900">{spot.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {spot.report_count} reports · <span className="capitalize font-medium">{spot.risk_level}</span> risk
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
                                <div className="min-w-[220px] space-y-2.5 text-sm p-1">
                                    <div>
                                        <p className="font-bold text-slate-900 text-base leading-snug">{pin.incident_type}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{pin.location_label}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <Badge variant="outline" className="text-[11px] capitalize font-medium">
                                            {pin.severity} severity
                                        </Badge>
                                        <Badge variant="outline" className="text-[11px] capitalize font-medium">
                                            {pin.status}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className="bg-blue-600 text-[11px] text-white">Mission active</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" variant="outline" className="h-8 text-xs flex-1" asChild>
                                            <Link href={`/admin/reports/${pin.concern_id}`}>View report</Link>
                                        </Button>
                                        {pin.mission_id && (
                                            <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs flex-1 text-white" asChild>
                                                <Link href={`/admin/missions/${pin.mission_id.replace('#', '')}`}>
                                                    Mission
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
                
                {/* Bottom-left stats indicator card */}
                <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-lg bg-slate-950/80 px-3.5 py-2.5 text-xs text-white backdrop-blur-md border border-slate-800 shadow-lg">
                    <p className="font-semibold text-slate-200">{pins.length} map pins visible</p>
                    {showHotspots && <p className="text-slate-400 mt-0.5">{hotspots.length} active hotspot zones</p>}
                </div>

                {/* Top-right severity legend card */}
                <div className="pointer-events-none absolute right-4 top-4 z-[400] rounded-lg bg-slate-950/80 px-3.5 py-2.5 text-xs text-white backdrop-blur-md border border-slate-800 shadow-lg">
                    <p className="mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">Severity Level</p>
                    <div className="flex flex-col gap-1.5">
                        {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                            <span key={level} className="flex items-center gap-2.5 capitalize text-slate-200 font-medium text-[11px]">
                                <span
                                    className="inline-block h-3 w-3 rounded-full border border-white/40 shadow-xs"
                                    style={{
                                        background:
                                            level === 'critical'
                                                ? '#dc2626'
                                                : level === 'high'
                                                  ? '#ea580c'
                                                  : level === 'medium'
                                                    ? '#ca8a04'
                                                    : '#16a34a',
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