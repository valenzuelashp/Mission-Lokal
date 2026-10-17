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
    className = 'h-full w-full',
}: Props) {
    const selected = pins.find((p) => p.id === selectedId);
    const { basemap, setBasemap } = useMapBasemap();

    return (
        <div className={`relative h-full w-full overflow-hidden ${className}`}>
            <MapContainer 
                center={center} 
                zoom={15} 
                scrollWheelZoom 
                className="h-full w-full z-0"
                zoomControl={true}
            >
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
                                <div className="text-xs p-2 min-w-[180px]">
                                    <p className="font-black text-slate-900 text-sm leading-snug">{spot.label}</p>
                                    <p className="text-slate-600 mt-1 font-semibold">
                                        {spot.report_count} reports · <span className="capitalize font-black text-rose-600">{spot.risk_level} Risk Zone</span>
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
                            <div className="min-w-[240px] max-w-[280px] space-y-3 text-xs p-1.5">
                                <div>
                                    <p className="font-black text-slate-900 text-sm leading-tight">{pin.incident_type}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 font-medium">{pin.location_label}</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="text-[10px] capitalize font-extrabold bg-slate-50">
                                        {pin.severity} severity
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] capitalize font-extrabold bg-slate-50">
                                        {pin.status}
                                    </Badge>
                                    {pin.has_mission && (
                                        <Badge className="bg-blue-600 text-[10px] text-white font-black">Mission Active</Badge>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                    <Button size="sm" variant="outline" className="h-8 text-xs flex-1 bg-white font-bold hover:bg-slate-50 rounded-xl" asChild>
                                        <Link href={`/admin/reports/${pin.concern_id}`}>View Report</Link>
                                    </Button>
                                    {pin.mission_id && (
                                        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs flex-1 text-white font-bold shadow-2xs rounded-xl" asChild>
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

            <MapBasemapToggle value={basemap} onChange={setBasemap} className="left-14 top-3 shadow-md" />
            
            <div className="pointer-events-none absolute bottom-4 left-4 z-[400] max-w-[calc(100%-2rem)] rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-lg backdrop-blur-md">
                <p className="font-black text-slate-900 leading-snug">{pins.length} Incident Pins Visible</p>
                {showHotspots && (
                    <p className="text-[11px] font-black text-rose-600 leading-tight mt-0.5">
                        {hotspots.length} Risk Zones Mapped
                    </p>
                )}
            </div>

            <div className="pointer-events-none absolute right-3 top-3 z-[400] rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 text-xs text-slate-700 shadow-lg backdrop-blur-md">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Severity Level</p>
                <div className="flex flex-col gap-1.5">
                    {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
                        <span key={level} className="flex items-center gap-2 capitalize font-black text-[11px] text-slate-700">
                            <span
                                className="inline-block h-3 w-3 rounded-full ring-2 ring-white shadow-xs"
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
    );
}