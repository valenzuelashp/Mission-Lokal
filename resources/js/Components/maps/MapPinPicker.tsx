import { MapContainer, Marker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useMemo, useRef } from 'react';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { MapBasemapTiles, MapBasemapToggle, useMapBasemap } from '@/Components/maps/MapBasemap';
import { Button } from '@/Components/ui/button';
import { LocateFixed, Loader2, MapPin } from 'lucide-react';
import { isInsideTambo, TAMBO_BOUNDS, TAMBO_MASK_STYLE, tamboMaskPositions } from '@/Lib/mapUtils';

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
    bounds?: [[number, number], [number, number]]; // Accepts the bounding box
    onPositionChange: (lat: number, lng: number) => void;
    className?: string;
};

// Handles clicking on the map to move the pin, ensuring they don't click outside the bounds
function MapClickHandler({
    onPositionChange,
    onOutOfBounds,
    contains,
}: {
    onPositionChange: (lat: number, lng: number) => void;
    onOutOfBounds: () => void;
    contains: (latlng: L.LatLng) => boolean;
}) {
    useMapEvents({
        click(e) {
            if (contains(e.latlng)) {
                onPositionChange(e.latlng.lat, e.latlng.lng);
                return;
            }

            onOutOfBounds();
        },
    });
    return null;
}

function Recenter({ center }: { center: [number, number] }) {
    const map = useMap();
    const skipFirst = useRef(true);
    useEffect(() => {
        if (skipFirst.current) {
            skipFirst.current = false;
            return;
        }
        map.panTo(center);
    }, [center, map]);
    return null;
}

function FitToBounds({ bounds, maxZoom }: { bounds: L.LatLngBounds; maxZoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom });
    }, [map, bounds, maxZoom]);
    return null;
}

export default function MapPinPicker({
    center,
    zoom = 15,
    position,
    bounds = TAMBO_BOUNDS,
    onPositionChange,
    className = 'h-56',
}: Props) {
    const pin = position ?? center;
    const [isLocating, setIsLocating] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const { basemap, setBasemap } = useMapBasemap();

    const placePin = (lat: number, lng: number) => {
        setNotice(null);
        onPositionChange(lat, lng);
    };

    // Convert raw array bounds into Leaflet Bounds object
    const leafletBounds = useMemo(() => {
        return bounds ? L.latLngBounds(bounds) : L.latLngBounds(TAMBO_BOUNDS);
    }, [bounds]);

    const containsPoint = (latlng: L.LatLng) => isInsideTambo(latlng.lat, latlng.lng);

    const maskingPolygon = useMemo(() => tamboMaskPositions(), []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setNotice('Location is not supported on this browser. Please tap the map or drag the pin.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = L.latLng(pos.coords.latitude, pos.coords.longitude);

                if (!containsPoint(newPos)) {
                    setNotice('Your GPS is outside Barangay Tambo. Please tap or drag the pin inside the barangay.');
                    setIsLocating(false);
                    return;
                }

                placePin(newPos.lat, newPos.lng);
                setIsLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                setNotice('Unable to read your GPS. Please allow location access, or tap the map to set the pin.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className={className}>
            <div className="h-full min-h-[14rem] overflow-hidden rounded-lg border relative bg-slate-100">
                <MapContainer 
                    bounds={leafletBounds}
                    scrollWheelZoom 
                    className="h-full w-full"
                    maxBounds={leafletBounds.pad(0.2)}
                    maxBoundsViscosity={0.9}
                >
                    <MapInvalidateSize />
                    <FitToBounds bounds={leafletBounds} maxZoom={zoom} />
                    <MapBasemapTiles basemap={basemap} />
                    
                    {maskingPolygon && (
                        <Polygon 
                            positions={maskingPolygon} 
                            pathOptions={TAMBO_MASK_STYLE} 
                            interactive={false} 
                        />
                    )}

                    <MapClickHandler
                        onPositionChange={placePin}
                        onOutOfBounds={() => setNotice('Please pin a location inside Barangay Tambo.')}
                        contains={containsPoint}
                    />
                    <Recenter center={pin} />
                    <Marker
                        position={pin}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const newPos = e.target.getLatLng();
                                if (!containsPoint(newPos)) {
                                    e.target.setLatLng(pin);
                                    setNotice('Please pin a location inside Barangay Tambo.');
                                    return;
                                }

                                placePin(newPos.lat, newPos.lng);
                            },
                        }}
                    />
                </MapContainer>

                <MapBasemapToggle value={basemap} onChange={setBasemap} />

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 z-[1000] shadow-md border bg-white hover:bg-slate-100 text-slate-700"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    aria-label="Use my current location"
                >
                    {isLocating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <LocateFixed className="mr-2 h-4 w-4" aria-hidden="true" />
                    )}
                    {isLocating ? 'Locating...' : 'Use My Location'}
                </Button>
            </div>
            {notice ? (
                <p role="status" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-amber-800">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {notice}
                </p>
            ) : (
                <p className="mt-2 text-xs text-muted-foreground">Tap the map, drag the pin, or use your GPS to set the location.</p>
            )}
        </div>
    );
}