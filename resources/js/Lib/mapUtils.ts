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
    const size = selected ? 18 : 14;
    const color = severityColors[severity];

    return L.divIcon({
        className: '',
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

export function severityFromScore(score: number): Severity {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}
