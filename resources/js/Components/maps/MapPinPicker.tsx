import { MapContainer, Marker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useMemo, useRef } from 'react';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { MapBasemapTiles, MapBasemapToggle, useMapBasemap } from '@/Components/maps/MapBasemap';
import { Button } from '@/Components/ui/button';
import { LocateFixed, Loader2, MapPin } from 'lucide-react';
import { isInsideTambo, TAMBO_BOUNDS, TAMBO_MASK_STYLE, tamboMaskPositions } from '@/Lib/mapUtils';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

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
    bounds?: [[number, number], [number, number]];
    onPositionChange: (lat: number, lng: number) => void;
    className?: string;
    compact?: boolean;
};

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
    className = 'h-64',
    compact = false,
}: Props) {
    const theme = useResidentTheme();
    const pin = position ?? center;
    const [isLocating, setIsLocating] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const { basemap, setBasemap } = useMapBasemap();

    const placePin = (lat: number, lng: number) => {
        setNotice(null);
        onPositionChange(lat, lng);
    };

    const leafletBounds = useMemo(() => {
        return bounds ? L.latLngBounds(bounds) : L.latLngBounds(TAMBO_BOUNDS);
    }, [bounds]);

    const containsPoint = (latlng: L.LatLng) => isInsideTambo(latlng.lat, latlng.lng);
    const maskingPolygon = useMemo(() => tamboMaskPositions(), []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setNotice('Location is not supported on this browser. Please tap the map.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = L.latLng(pos.coords.latitude, pos.coords.longitude);

                if (!containsPoint(newPos)) {
                    setNotice('Your GPS is outside Barangay Tambo. Please place the pin inside the barangay.');
                    setIsLocating(false);
                    return;
                }

                placePin(newPos.lat, newPos.lng);
                setIsLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                setNotice('Unable to read your GPS. Please tap the map to set your location.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className={className}>
            <div className={`h-full ${compact ? 'min-h-0' : 'min-h-[18rem]'} overflow-hidden rounded-2xl border ${theme.cardBorder} relative ${theme.inputBg} shadow-md`}>
                <MapContainer 
                    bounds={leafletBounds}
                    scrollWheelZoom 
                    className="h-full w-full z-0"
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
                    className={`absolute ${compact ? 'bottom-2 right-2 h-8 px-2.5 text-[10px]' : 'bottom-4 right-4 h-10 px-4'} z-[1000] shadow-lg border ${theme.cardBorder} ${theme.cardBg} font-black rounded-2xl`}
                    onClick={handleGetLocation}
                    disabled={isLocating}
                >
                    {isLocating ? (
                        <Loader2 className={`mr-2 h-4 w-4 animate-spin ${theme.primaryText}`} />
                    ) : (
                        <LocateFixed className={`mr-2 h-4 w-4 ${theme.primaryText}`} />
                    )}
                    {isLocating ? 'Locating...' : 'Use My GPS Location'}
                </Button>
            </div>
            {notice ? (
                <p role="status" className={`${compact ? 'mt-1 px-2 py-1 text-[10px]' : 'mt-2.5 p-3 text-xs'} flex items-start gap-2 font-bold text-amber-900 bg-amber-50 rounded-xl border border-amber-200`}>
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    {notice}
                </p>
            ) : (
                <p className={`${compact ? 'mt-1 text-[10px]' : 'mt-2.5 text-xs'} font-medium ${theme.textMuted}`}>Tap the map or drag the pin to pinpoint the exact issue location.</p>
            )}
        </div>
    );
}