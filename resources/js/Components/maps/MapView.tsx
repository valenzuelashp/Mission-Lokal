import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
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
    center: [number, number];
    zoom?: number;
    pins?: MapPin[];
    className?: string;
    onPinDrop?: (lat: number, lng: number) => void;
};

export default function MapView({ center, zoom = 15, pins = [], className = 'h-64' }: Props) {
    return (
        <div className={className}>
            <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
                <MapInvalidateSize />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {pins.map((pin) => (
                    <Marker key={pin.id} position={[pin.lat, pin.lng]}>
                        <Popup>{pin.title}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
