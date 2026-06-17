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

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Operations map</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Live concern pins and predicted hotspot zones across the barangay.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>
                        <strong className="text-foreground">{activeCount}</strong> active ·{' '}
                        <strong className="text-foreground">{hotspots.length}</strong> hotspots
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100vh-11rem)] lg:grid-cols-[320px_1fr]">
                <div className="max-h-[45vh] overflow-hidden lg:max-h-none">
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
                <AdminFullMap
                    pins={filtered}
                    hotspots={hotspots}
                    showHotspots={showHotspots}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    className="h-[50vh] min-h-[280px] lg:h-full"
                />
            </div>
        </AdminLayout>
    );
}
