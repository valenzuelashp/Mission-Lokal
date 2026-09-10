import L from 'leaflet';
import type { AdminMapHotspot, Severity } from '@/Types';

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