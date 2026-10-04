import { Head } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminFullMap from '@/Components/admin/AdminFullMap';
import MapPinSidebar from '@/Components/admin/MapPinSidebar';
import AdminLayout from '@/Layouts/AdminLayout';
import { demoHotspots, demoMapPins, mapFilterCounts } from '@/Lib/adminDemo';
import type { AdminMapPageProps, IncidentTypeIcon, MapPinStatus, Severity } from '@/Types';

export default function MapPage(props: Partial<AdminMapPageProps>) {
    const allPins = props.pins ?? demoMapPins;
    const hotspots = props.hotspots ?? demoHotspots;

    const [severity, setSeverity] = useState<'all' | Severity>('all');
    const [status, setStatus] = useState<'all' | MapPinStatus>('all');
    const [type, setType] = useState<'all' | IncidentTypeIcon>('all');
    const [search, setSearch] = useState('');
    const [showHotspots, setShowHotspots] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return allPins.filter((pin) => {
            const matchesSeverity = severity === 'all' || pin.severity === severity;
            const matchesStatus = status === 'all' || pin.status === status;
            const matchesType = type === 'all' || pin.type_icon === type;
            const matchesSearch =
                !q ||
                pin.incident_type.toLowerCase().includes(q) ||
                pin.location_label.toLowerCase().includes(q) ||
                pin.report_id.toLowerCase().includes(q);

            return matchesSeverity && matchesStatus && matchesType && matchesSearch;
        });
    }, [allPins, severity, status, type, search]);

    const counts = useMemo(() => mapFilterCounts(allPins), [allPins]);
    const activeCount = allPins.filter((p) => p.status === 'active').length;

    return (
        <AdminLayout title="Mission-Lokal Admin: Map">
            <Head title="Operations Map" />

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/80 pb-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Geospatial Operations Radar</h2>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">
                        Live municipal incident pins and AI-predicted risk hotspot zones across the barangay sector.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 self-start sm:self-auto">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>
                        <strong className="text-slate-900">{activeCount}</strong> active pins ·{' '}
                        <strong className="text-rose-600">{hotspots.length}</strong> risk zones
                    </span>
                </div>
            </div>

            {/* Responsive Container: Full vertical view on desktop, stacked on mobile with no clipped borders */}
            <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100vh-11.5rem)] lg:min-h-[580px] lg:grid-cols-[360px_1fr] items-stretch">
                <div className="h-[480px] lg:h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm flex flex-col">
                    <MapPinSidebar
                        pins={filtered}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        severity={severity}
                        onSeverity={setSeverity}
                        status={status}
                        onStatus={setStatus}
                        type={type}
                        onType={setType}
                        search={search}
                        onSearch={setSearch}
                        showHotspots={showHotspots}
                        onToggleHotspots={() => setShowHotspots((v) => !v)}
                        counts={counts}
                    />
                </div>
                <div className="h-[520px] lg:h-full w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-sm relative">
                    <AdminFullMap
                        pins={filtered}
                        hotspots={hotspots}
                        showHotspots={showHotspots}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        className="h-full w-full"
                    />
                </div>
            </div>
        </AdminLayout>
    );
}