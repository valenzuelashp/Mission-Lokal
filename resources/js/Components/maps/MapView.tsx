import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { createPinIcon, severityColors } from '@/Lib/mapUtils';
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
    center: [number, number];
    zoom?: number;
    pins?: MapPin[];
    className?: string;
    showLegend?: boolean;
    onPinDrop?: (lat: number, lng: number) => void;
};

const legendLevels: Severity[] = ['critical', 'high', 'medium', 'low'];

export default function MapView({
    center,
    zoom = 15,
    pins = [],
    className = 'h-64',
    showLegend = false,
}: Props) {
    return (
        <div className={className}>
            <div className="relative h-full min-h-[12rem] overflow-hidden rounded-lg">
                <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
                    <MapInvalidateSize />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                                    <div className="min-w-[140px] text-sm">
                                        <p className="font-semibold">{pin.title}</p>
                                        <p className="mt-1 capitalize text-muted-foreground">{severity} severity</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                {showLegend && (
                    <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1.5 text-[10px] shadow-sm">
                        <p className="mb-1 font-semibold uppercase tracking-wide text-slate-600">Severity</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                            {legendLevels.map((level) => (
                                <span key={level} className="flex items-center gap-1 capitalize text-slate-700">
                                    <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{ background: severityColors[level] }}
                                    />
                                    {level}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
