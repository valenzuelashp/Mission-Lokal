import { Head } from '@inertiajs/react';
import { Layers, Radio } from 'lucide-react';
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

            <div className="mx-auto max-w-[100rem] space-y-6 pb-12">
                
                {/* Header Title Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/60">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                <Radio className="h-3 w-3 animate-pulse text-blue-600" /> Live GIS Telemetry
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            Geospatial Operations Radar
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                            Live municipal incident pins and AI-predicted risk hotspot zones across the barangay sector.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-2xs shrink-0 self-start md:self-auto">
                        <Layers className="h-4 w-4 text-blue-600" />
                        <span>
                            <strong className="text-slate-900">{activeCount}</strong> active pins ·{' '}
                            <strong className="text-rose-600">{hotspots.length}</strong> risk zones
                        </span>
                    </div>
                </div>

                {/* Responsive Container: Full vertical view on desktop, stacked on mobile with no clipped borders */}
                <div className="flex flex-col gap-6 lg:grid lg:h-[calc(100vh-13rem)] lg:min-h-[600px] lg:grid-cols-[380px_1fr] items-stretch">
                    <div className="h-[500px] lg:h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs flex flex-col">
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
                    <div className="h-[560px] lg:h-full w-full rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-2xs relative">
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
            </div>
        </AdminLayout>
    );
}