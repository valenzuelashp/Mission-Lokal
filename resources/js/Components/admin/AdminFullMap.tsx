import { Link } from '@inertiajs/react';
import { Circle, MapContainer, Marker, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { MapBasemapTiles, MapBasemapToggle, useMapBasemap } from '@/Components/maps/MapBasemap';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { createPinIcon, hotspotColors, TAMBO_CENTER, TAMBO_MASK_STYLE, tamboMaskPositions } from '@/Lib/mapUtils';
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
    center = TAMBO_CENTER,
    className = 'h-[75vh] min-h-[500px] lg:h-full',
}: Props) {
    const selected = pins.find((p) => p.id === selectedId);
    const { basemap, setBasemap } = useMapBasemap();

    return (
        <div className={className}>
            <div className="relative h-full min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                <MapContainer center={center} zoom={15} scrollWheelZoom className="h-full w-full z-0">
                    <MapInvalidateSize />
                    <MapBasemapTiles basemap={basemap} />
                    <Polygon
                        positions={tamboMaskPositions()}
                        pathOptions={TAMBO_MASK_STYLE}
                        interactive={false}
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
                                    fillOpacity: 0.25,
                                    weight: 2.5,
                                    opacity: 0.9,
                                }}
                            >
                                <Popup>
                                    <div className="text-sm p-2">
                                        <p className="font-bold text-slate-900">{spot.label}</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {spot.report_count} reports · <span className="capitalize font-semibold">{spot.risk_level}</span> risk zone
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
                                <div className="min-w-[240px] space-y-3 text-sm p-1.5">
                                    <div>
                                        <p className="font-extrabold text-slate-900 text-base leading-snug">{pin.incident_type}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{pin.location_label}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        <Badge variant="outline" className="text-[11px] capitalize font-semibold bg-slate-50">
                                            {pin.severity} severity
                                        </Badge>
                                        <Badge variant="outline" className="text-[11px] capitalize font-semibold bg-slate-50">
                                            {pin.status}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className="bg-blue-600 text-[11px] text-white font-semibold">Mission Active</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                                        <Button size="sm" variant="outline" className="h-8 text-xs flex-1 bg-white hover:bg-slate-50" asChild>
                                            <Link href={`/admin/reports/${pin.concern_id}`}>View Report</Link>
                                        </Button>
                                        {pin.mission_id && (
                                            <Button size="sm" className="h-8 bg-blue-700 hover:bg-blue-800 text-xs flex-1 text-white shadow-xs" asChild>
                                                <Link href={`/admin/missions/${pin.mission_id.replace('#', '')}`}>
                                                    Mission Board
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

                <MapBasemapToggle value={basemap} onChange={setBasemap} />
                
                <div className="pointer-events-none absolute bottom-4 left-4 z-[400] rounded-xl border border-slate-200/80 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-lg backdrop-blur-md">
                    <p className="font-bold text-slate-900">{pins.length} active map pins</p>
                    {showHotspots && <p className="mt-0.5 text-xs font-semibold text-rose-600">{hotspots.length} risk hotspot zones identified</p>}
                </div>

                <div className="pointer-events-none absolute right-4 top-4 z-[400] rounded-xl border border-slate-200/80 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-lg backdrop-blur-md">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Severity Tiers</p>
                    <div className="flex flex-col gap-1.5">
                        {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                            <span key={level} className="flex items-center gap-2.5 capitalize font-medium text-xs">
                                <span
                                    className="inline-block h-3 w-3 rounded-full ring-2 ring-white shadow-sm"
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