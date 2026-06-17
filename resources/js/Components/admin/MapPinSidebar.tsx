import { Droplets, Flame, Lightbulb, Search, Trash2, Volume2, Waves } from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { cn } from '@/Lib/utils';
import { severityColors } from '@/Lib/mapUtils';
import type { AdminMapPin, IncidentTypeIcon, MapPinStatus, Severity } from '@/Types';

const typeIcons: Record<IncidentTypeIcon, typeof Flame> = {
    fire: Flame,
    flood: Waves,
    waste: Trash2,
    noise: Volume2,
    drainage: Droplets,
    light: Lightbulb,
};

const severityTabs: { key: 'all' | Severity; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
];

const statusTabs: { key: 'all' | MapPinStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
];

const typeTabs: { key: 'all' | IncidentTypeIcon; label: string }[] = [
    { key: 'all', label: 'All types' },
    { key: 'fire', label: 'Fire / hazard' },
    { key: 'flood', label: 'Flood' },
    { key: 'drainage', label: 'Drainage' },
    { key: 'waste', label: 'Waste' },
    { key: 'noise', label: 'Noise' },
    { key: 'light', label: 'Lights' },
];

type Props = {
    pins: AdminMapPin[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    severity: 'all' | Severity;
    onSeverity: (v: 'all' | Severity) => void;
    status: 'all' | MapPinStatus;
    onStatus: (v: 'all' | MapPinStatus) => void;
    type: 'all' | IncidentTypeIcon;
    onType: (v: 'all' | IncidentTypeIcon) => void;
    search: string;
    onSearch: (v: string) => void;
    showHotspots: boolean;
    onToggleHotspots: () => void;
    counts: Record<string, number>;
};

export default function MapPinSidebar({
    pins,
    selectedId,
    onSelect,
    severity,
    onSeverity,
    status,
    onStatus,
    type,
    onType,
    search,
    onSearch,
    showHotspots,
    onToggleHotspots,
    counts,
}: Props) {
    return (
        <div className="flex h-full flex-col rounded-lg border bg-card shadow-sm">
            <div className="border-b p-4">
                <h3 className="text-sm font-semibold text-blue-900">Filters</h3>
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search location or report…"
                        className="pl-9"
                    />
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={showHotspots}
                        onChange={onToggleHotspots}
                        className="rounded border-gray-300"
                    />
                    Show hotspot zones
                </label>
            </div>

            <div className="space-y-3 border-b p-4">
                <FilterRow label="Severity" tabs={severityTabs} active={severity} onChange={onSeverity} counts={counts} prefix="sev" />
                <FilterRow label="Status" tabs={statusTabs} active={status} onChange={onStatus} counts={counts} prefix="status" />
                <FilterRow label="Type" tabs={typeTabs} active={type} onChange={onType} counts={counts} prefix="type" />
            </div>

            <div className="flex items-center justify-between border-b px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pins ({pins.length})
                </p>
            </div>

            <div className="flex-1 overflow-y-auto">
                {pins.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No pins match the current filters.</p>
                ) : (
                    pins.map((pin) => {
                        const Icon = typeIcons[pin.type_icon];
                        const sev = pin.severity ?? 'medium';
                        return (
                            <button
                                key={pin.id}
                                type="button"
                                onClick={() => onSelect(pin.id)}
                                className={cn(
                                    'flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40',
                                    selectedId === pin.id && 'bg-red-50',
                                )}
                            >
                                <div
                                    className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${severityColors[sev]}22` }}
                                >
                                    <Icon className="h-4 w-4" style={{ color: severityColors[sev] }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{pin.incident_type}</p>
                                    <p className="truncate text-xs text-muted-foreground">{pin.location_label}</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        <Badge variant="outline" className="text-[10px]">
                                            {pin.report_id}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className="bg-blue-700 text-[10px]">Mission</Badge>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

type FilterRowProps<T extends string> = {
    label: string;
    tabs: { key: T; label: string }[];
    active: T;
    onChange: (key: T) => void;
    counts: Record<string, number>;
    prefix: string;
};

function FilterRow<T extends string>({ label, tabs, active, onChange, counts, prefix }: FilterRowProps<T>) {
    return (
        <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
            <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'rounded-full px-2 py-1 text-xs font-medium transition-colors',
                            active === tab.key
                                ? 'bg-red-600 text-white'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80',
                        )}
                    >
                        {tab.label}
                        <span className="ml-1 opacity-75">({counts[`${prefix}_${tab.key}`] ?? 0})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
