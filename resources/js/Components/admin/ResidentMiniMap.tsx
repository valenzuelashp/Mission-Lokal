import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { OSM_ATTRIBUTION, OSM_TILE_URL } from '@/Lib/mapUtils';

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
        <div className={`overflow-hidden rounded-lg border ${className}`}>
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                className="h-full w-full"
            >
                <MapInvalidateSize />
                <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
                <Marker position={[lat, lng]} />
            </MapContainer>
        </div>
    );
}
