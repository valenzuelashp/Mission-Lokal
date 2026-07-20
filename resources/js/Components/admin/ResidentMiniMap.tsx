import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';

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
    lat: number;
    lng: number;
    className?: string;
};

export default function ResidentMiniMap({ lat, lng, className = 'h-28' }: Props) {
    return (
        <div className={`overflow-hidden rounded-2xl border border-neutral-200 shadow-inner min-h-[112px] relative z-10 ${className}`}>
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                className="h-full w-full"
            >
                <MapInvalidateSize />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[lat, lng]} />
            </MapContainer>
        </div>
    );
}