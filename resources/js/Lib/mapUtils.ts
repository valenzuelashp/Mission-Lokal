import L from 'leaflet';
import type { AdminMapHotspot, Severity } from '@/Types';

/** Barangay Tambo, Parañaque — Google Maps administrative outline. */
export const TAMBO_CENTER: [number, number] = [14.5173079, 120.9933811];

/** Southwest and northeast of the Tambo outline. */
export const TAMBO_BOUNDS: [[number, number], [number, number]] = [
    [14.5059, 120.9766288],
    [14.5235931, 121.0011399],
];

/** Barangay outline aligned to Google Maps (Okada + PITX in, Solaire / Baclaran out). */
export const TAMBO_POLYGON: [number, number][] = [
    [14.5127238, 120.9766288],
    [14.51217, 120.9776563],
    [14.512027, 120.9780538],
    [14.5113162, 120.9793877],
    [14.5106781, 120.980554],
    [14.5096613, 120.9799644],
    [14.5089202, 120.9813586],
    [14.5081455, 120.982823],
    [14.5101523, 120.9838984],
    [14.5121086, 120.9848829],
    [14.5124875, 120.9839737],
    [14.5127436, 120.9828005],
    [14.5129758, 120.9827421],
    [14.5133897, 120.9828405],
    [14.5143101, 120.9833017],
    [14.5140529, 120.9845131],
    [14.5138578, 120.9858824],
    [14.5140559, 120.98725],
    [14.5142432, 120.988438],
    [14.5142257, 120.9898354],
    [14.5127608, 120.9895507],
    [14.5111225, 120.9889958],
    [14.5112528, 120.9886097],
    [14.5100113, 120.9882501],
    [14.5099205, 120.9885491],
    [14.5082817, 120.9879717],
    [14.5081191, 120.9885932],
    [14.50615, 120.9881],
    [14.5059, 120.9897],
    [14.5068, 120.99125],
    [14.5074, 120.9931],
    [14.5079, 120.9945],
    [14.5081974, 120.9953901],
    [14.5093718, 120.9957651],
    [14.5109174, 120.99616],
    [14.5115107, 120.9963693],
    [14.5124567, 120.9972133],
    [14.5130218, 120.9976768],
    [14.5129959, 120.9977881],
    [14.5128223, 120.9985437],
    [14.5127143, 120.9987497],
    [14.51249, 120.9989814],
    [14.5123321, 120.9990758],
    [14.5120745, 120.9991359],
    [14.5115931, 120.9990678],
    [14.5110761, 120.9990662],
    [14.5108641, 120.9990797],
    [14.5107201, 120.9991788],
    [14.5105788, 120.999402],
    [14.5104415, 120.9996511],
    [14.5102714, 121.0000886],
    [14.5102511, 121.0002045],
    [14.5105952, 121.000251],
    [14.5109672, 121.0002798],
    [14.5113071, 121.000297],
    [14.5115005, 121.0003076],
    [14.5114566, 121.0007576],
    [14.5118637, 121.0008785],
    [14.5118236, 121.0011142],
    [14.512241, 121.0011399],
    [14.5123726, 121.0010979],
    [14.5124877, 121.0010134],
    [14.5129342, 121.0010078],
    [14.5134705, 121.0011015],
    [14.5138731, 121.0010924],
    [14.5150221, 121.0009063],
    [14.5169396, 121.0004667],
    [14.516952, 121.0001553],
    [14.5169829, 120.9984257],
    [14.5169942, 120.9980343],
    [14.5181368, 120.9986306],
    [14.5187264, 120.9989276],
    [14.519445, 120.9993364],
    [14.5196816, 120.9994212],
    [14.5199691, 120.9993459],
    [14.5204461, 120.9990599],
    [14.5220935, 120.9988435],
    [14.5228373, 120.99888],
    [14.5235931, 120.998868],
    [14.5235646, 120.9987346],
    [14.5232256, 120.9970038],
    [14.5232079, 120.9968857],
    [14.5230235, 120.995657],
    [14.5230078, 120.9955518],
    [14.5229905, 120.9954049],
    [14.5229376, 120.9948758],
    [14.5228977, 120.9944766],
    [14.5228464, 120.9939642],
    [14.5228393, 120.9938926],
    [14.5228318, 120.9938183],
    [14.522807, 120.99357],
    [14.5227867, 120.9933895],
    [14.5227432, 120.9930264],
    [14.5226456, 120.9922136],
    [14.522638, 120.9921498],
    [14.522611, 120.9919247],
    [14.5225084, 120.9910704],
    [14.5217176, 120.9850234],
    [14.5213498, 120.9826362],
    [14.521284, 120.9822582],
    [14.5211043, 120.9812245],
    [14.5210934, 120.9811606],
    [14.5210822, 120.9810929],
    [14.5208798, 120.9798786],
    [14.5207975, 120.9793299],
    [14.5207997, 120.9793907],
    [14.5203617, 120.9793586],
    [14.5196074, 120.9793304],
    [14.5192114, 120.9793304],
    [14.5190465, 120.9793223],
    [14.5188593, 120.9793028],
    [14.5173513, 120.9789113],
    [14.5166067, 120.9787329],
    [14.5143999, 120.9776849],
    [14.5137746, 120.9773471],
    [14.5137996, 120.9773015],
    [14.5130662, 120.9768989],
    [14.5128008, 120.9767477],
    [14.5127739, 120.976651],
    [14.5127238, 120.9766288],
];

/** Dark overlay for land outside Tambo. */
export const TAMBO_MASK_STYLE = {
    color: 'transparent' as const,
    fillColor: '#0f172a',
    fillOpacity: 0.72,
};

/** Local mask ring with a Tambo-shaped hole. */
export function tamboMaskPositions(pad = 0.12): [number, number][][] {
    const sw = TAMBO_BOUNDS[0];
    const ne = TAMBO_BOUNDS[1];
    const outer: [number, number][] = [
        [sw[0] - pad, sw[1] - pad],
        [ne[0] + pad, sw[1] - pad],
        [ne[0] + pad, ne[1] + pad],
        [sw[0] - pad, ne[1] + pad],
    ];
    return [outer, TAMBO_POLYGON];
}

export function isInsideTambo(lat: number, lng: number, ring: [number, number][] = TAMBO_POLYGON): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const latI = ring[i][0];
        const lngI = ring[i][1];
        const latJ = ring[j][0];
        const lngJ = ring[j][1];
        const intersect = latI > lat !== latJ > lat && lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;
        if (intersect) inside = !inside;
    }
    return inside;
}

export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export type MapBasemapId = 'streets' | 'gray' | 'humanitarian' | 'satellite' | 'hybrid' | 'terrain';

export const MAP_BASEMAPS: Record<
    MapBasemapId,
    { id: MapBasemapId; label: string; url: string; attribution: string; maxZoom: number; overlays?: string[] }
> = {
    streets: {
        id: 'streets',
        label: 'Plain',
        url: OSM_TILE_URL,
        attribution: OSM_ATTRIBUTION,
        maxZoom: 19,
    },
    gray: {
        id: 'gray',
        label: 'Light gray',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 16,
        overlays: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        ],
    },
    humanitarian: {
        id: 'humanitarian',
        label: 'Humanitarian',
        url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap, Tiles style by Humanitarian OpenStreetMap Team',
        maxZoom: 19,
    },
    satellite: {
        id: 'satellite',
        label: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
    },
    hybrid: {
        id: 'hybrid',
        label: 'Hybrid',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
        overlays: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
            'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        ],
    },
    terrain: {
        id: 'terrain',
        label: 'Terrain',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap, &copy; OpenTopoMap (CC-BY-SA)',
        maxZoom: 17,
    },
};

export const severityColors: Record<Severity, string> = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#ca8a04',
    low: '#16a34a',
};

export const hotspotColors: Record<AdminMapHotspot['risk_level'], string> = {
    high: '#dc2626',
    medium: '#ea580c',
    low: '#eab308',
};

export function createPinIcon(severity: Severity, selected = false) {
    // INCREASED SIZES: Changed default from 14px to 28px, selected from 18px to 36px so they are easily visible at any zoom level
    const size = selected ? 36 : 28;
    const color = severityColors[severity];

    const shadowStyle = selected 
        ? '0 0 0 4px rgba(59, 130, 246, 0.7), 0 4px 12px rgba(0,0,0,0.6)' 
        : '0 2px 6px rgba(0,0,0,0.5)';

    return L.divIcon({
        className: '',
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:${shadowStyle};display:flex;align-items:center;justify-content:center;transition:all 0.2s ease;"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
    });
}

export function severityFromScore(score: number): Severity {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

export function scoreFromSeverity(severity?: Severity | string | null): number {
    switch (severity) {
        case 'critical':
            return 92;
        case 'high':
            return 78;
        case 'low':
            return 22;
        default:
            return 50;
    }
}