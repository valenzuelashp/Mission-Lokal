import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
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
    center: [number, number];
    zoom?: number;
    position: [number, number] | null;
    onPositionChange: (lat: number, lng: number) => void;
    className?: string;
};

function MapClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function Recenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function MapPinPicker({ center, zoom = 15, position, onPositionChange, className = 'h-56' }: Props) {
    const pin = position ?? center;

    return (
        <div className={className}>
            <div className="h-full min-h-[14rem] overflow-hidden rounded-lg border">
                <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
                    <MapInvalidateSize />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onPositionChange={onPositionChange} />
                    <Recenter center={pin} />
                    <Marker
                        position={pin}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const { lat, lng } = e.target.getLatLng();
                                onPositionChange(lat, lng);
                            },
                        }}
                    />
                </MapContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Tap the map or drag the pin to set the location.</p>
        </div>
    );
}
