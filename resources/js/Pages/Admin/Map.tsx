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
        <AdminLayout title="Mission-Lokal Admin: Mapping Framework Overlay">
            <Head title="Operations Mapping Center" />

            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-neutral-200/40 pb-4">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Operations map view</h2>
                    <p className="mt-1 text-xs font-medium text-neutral-500 max-w-md leading-relaxed">
                        Live cartographic telemetry tracking and ML predicted spatial risk vectors mapped over bounds.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200/40 shadow-2xs">
                    <Layers className="h-3.5 w-3.5 text-neutral-500" />
                    <span>
                        <strong className="text-neutral-900 font-black tabular-nums">{activeCount}</strong> arrays live ·{' '}
                        <strong className="text-neutral-900 font-black tabular-nums">{hotspots.length}</strong> vector spots
                    </span>
                </div>
            </div>

            {/* Locked Height Spatial Operations Container Workspace */}
            <div className="flex flex-col gap-5 lg:grid lg:h-[calc(100vh-12rem)] lg:grid-cols-[340px_1fr]">
                <div className="max-h-[45vh] overflow-hidden lg:max-h-none h-full">
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
                <div className="h-[50vh] min-h-[300px] lg:h-full relative z-10">
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