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
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-lg border bg-slate-900">
                <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
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
                                    fillOpacity: 0.18,
                                    weight: 2,
                                    opacity: 0.6,
                                }}
                            >
                                <Popup>
                                    <div className="text-sm">
                                        <p className="font-semibold">{spot.label}</p>
                                        <p className="text-muted-foreground">
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
                                <div className="min-w-[200px] space-y-2 text-sm">
                                    <div>
                                        <p className="font-semibold">{pin.incident_type}</p>
                                        <p className="text-xs text-muted-foreground">{pin.location_label}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline" className="text-[10px] capitalize">
                                            {pin.severity}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] capitalize">
                                            {pin.status}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className="bg-blue-700 text-[10px]">Mission active</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                                            <Link href={`/admin/reports/${pin.concern_id}`}>View report</Link>
                                        </Button>
                                        {pin.mission_id && (
                                            <Button size="sm" className="h-7 bg-blue-700 text-xs" asChild>
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
                <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm">
                    <p className="font-medium">{pins.length} pins visible</p>
                    {showHotspots && <p className="text-white/70">{hotspots.length} hotspot zones</p>}
                </div>
                <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/60 px-3 py-2 text-xs text-white backdrop-blur-sm">
                    <p className="mb-1 font-semibold uppercase tracking-wide">Severity</p>
                    <div className="flex flex-col gap-1">
                        {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                            <span key={level} className="flex items-center gap-2 capitalize">
                                <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
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
