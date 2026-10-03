import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { MapBasemapTiles, MapBasemapToggle, useMapBasemap } from '@/Components/maps/MapBasemap';
import { createPinIcon, severityColors } from '@/Lib/mapUtils';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
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
    const theme = useResidentTheme();
    const { basemap, setBasemap } = useMapBasemap();

    return (
        <div className={className}>
            <div className={`relative h-full min-h-[12rem] overflow-hidden rounded-xl border ${theme.cardBorder} shadow-sm ${theme.cardBg}`}>
                <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full z-0">
                    <MapInvalidateSize />
                    <MapBasemapTiles basemap={basemap} />
                    {pins.map((pin) => {
                        const severity = (pin.severity ?? 'medium') as Severity;
                        return (
                            <Marker
                                key={pin.id}
                                position={[pin.lat, pin.lng]}
                                icon={createPinIcon(severity)}
                            >
                                <Popup>
                                    <div className="min-w-[140px] text-sm p-1">
                                        <p className={`font-bold ${theme.textMain}`}>{pin.title}</p>
                                        <p className={`mt-0.5 capitalize text-xs ${theme.textMuted} font-semibold`}>{severity} severity</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                <MapBasemapToggle value={basemap} onChange={setBasemap} />
                {showLegend && (
                    <div className={`pointer-events-none absolute bottom-2 left-2 z-[400] rounded-lg border ${theme.cardBorder} ${theme.cardBg}/95 px-2.5 py-1.5 text-[10px] shadow-sm backdrop-blur-xs`}>
                        <p className={`mb-1 font-extrabold uppercase tracking-wider ${theme.textMuted}`}>Severity</p>
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                            {legendLevels.map((level) => (
                                <span key={level} className={`flex items-center gap-1 capitalize font-semibold ${theme.textMain}`}>
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