import { MapContainer, Marker, TileLayer, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState, useMemo } from 'react';
import MapInvalidateSize from '@/Components/maps/MapInvalidateSize';
import { Button } from '@/Components/ui/button';
import { LocateFixed, Loader2 } from 'lucide-react';

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
function MapClickHandler({ onPositionChange, bounds }: { onPositionChange: (lat: number, lng: number) => void, bounds: L.LatLngBounds | null }) {
    useMapEvents({
        click(e) {
            // Only allow dropping a pin if it falls inside the jurisdiction box
            if (!bounds || bounds.contains(e.latlng)) {
                onPositionChange(e.latlng.lat, e.latlng.lng);
            }
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

export default function MapPinPicker({ center, zoom = 15, position, bounds, onPositionChange, className = 'h-56' }: Props) {
    const pin = position ?? center;
    const [isLocating, setIsLocating] = useState(false);

    // Convert raw array bounds into Leaflet Bounds object
    const leafletBounds = useMemo(() => {
        return bounds ? L.latLngBounds(bounds) : null;
    }, [bounds]);

    // Create the inverted polygon to gray out the outside area
    const maskingPolygon = useMemo(() => {
        if (!leafletBounds) return null;

        // Outer ring covering the whole world
        const outerRing: [number, number][] = [
            [-90, -180],
            [90, -180],
            [90, 180],
            [-90, 180],
        ];

        // Inner ring (the hole) matching your barangay boundary
        const innerRing: [number, number][] = [
            [leafletBounds.getSouth(), leafletBounds.getWest()],
            [leafletBounds.getNorth(), leafletBounds.getWest()],
            [leafletBounds.getNorth(), leafletBounds.getEast()],
            [leafletBounds.getSouth(), leafletBounds.getEast()],
        ];

        return [outerRing, innerRing];
    }, [leafletBounds]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = L.latLng(pos.coords.latitude, pos.coords.longitude);
                
                // If they try to use GPS but they are physically outside the barangay
                if (leafletBounds && !leafletBounds.contains(newPos)) {
                    alert('You appear to be outside the barangay jurisdiction. Please move the pin manually.');
                    setIsLocating(false);
                    return;
                }

                onPositionChange(newPos.lat, newPos.lng);
                setIsLocating(false);
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location. Please ensure location permissions are allowed.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <div className={className}>
            <div className="h-full min-h-[14rem] overflow-hidden rounded-lg border relative bg-slate-100">
                <MapContainer 
                    center={center} 
                    zoom={zoom} 
                    scrollWheelZoom 
                    className="h-full w-full"
                    // Lock the camera to the barangay so they can't wander away
                    maxBounds={leafletBounds ?? undefined}
                    maxBoundsViscosity={1.0} // Gives it a solid "wall" feeling
                >
                    <MapInvalidateSize />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* The gray mask that darkens everything outside the boundary */}
                    {maskingPolygon && (
                        <Polygon 
                            positions={maskingPolygon} 
                            pathOptions={{ color: 'transparent', fillColor: '#1e293b', fillOpacity: 0.6 }} 
                            interactive={false} 
                        />
                    )}

                    <MapClickHandler onPositionChange={onPositionChange} bounds={leafletBounds} />
                    <Recenter center={pin} />
                    <Marker
                        position={pin}
                        draggable
                        eventHandlers={{
                            dragend: (e) => {
                                const newPos = e.target.getLatLng();
                                // Snap the pin back inside if they somehow drag it over the wall
                                if (leafletBounds && !leafletBounds.contains(newPos)) {
                                    e.target.setLatLng(pin);
                                    alert('The location must be inside the barangay boundary.');
                                } else {
                                    onPositionChange(newPos.lat, newPos.lng);
                                }
                            },
                        }}
                    />
                </MapContainer>

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
            <p className="mt-2 text-xs text-muted-foreground">Tap the map, drag the pin, or use your GPS to set the location.</p>
        </div>
    );
}