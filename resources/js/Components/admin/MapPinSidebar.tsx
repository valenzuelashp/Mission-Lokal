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
    { key: 'medium', label: 'Med' },
    { key: 'low', label: 'Low' },
];

const statusTabs: { key: 'all' | MapPinStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
];

const typeTabs: { key: 'all' | IncidentTypeIcon; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'fire', label: 'Fire' },
    { key: 'flood', label: 'Flood' },
    { key: 'drainage', label: 'Drainage' },
    { key: 'waste', label: 'Waste' },
    { key: 'noise', label: 'Noise' },
    { key: 'light', label: 'Light' },
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
        <div className="flex h-full w-full flex-col bg-white overflow-hidden">
            {/* Header, Search & Hotspot Toggle */}
            <div className="border-b border-slate-100 bg-slate-50/80 p-5 space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Spatial Radar</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Filter & locate operational incidents</p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-black text-slate-700 shadow-2xs hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={showHotspots}
                            onChange={onToggleHotspots}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        Risk Zones
                    </label>
                </div>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search incident, zone, or ID…"
                        className="pl-10 bg-white text-xs h-10 border-slate-200 shadow-2xs rounded-xl"
                    />
                </div>
            </div>

            {/* Filter Section: Auto-fit scrolling with no clipped pills */}
            <div className="space-y-3 border-b border-slate-100 p-4 bg-white shrink-0 max-h-[240px] overflow-y-auto">
                <FilterRow label="Severity" tabs={severityTabs} active={severity} onChange={onSeverity} counts={counts} prefix="sev" />
                <FilterRow label="Status" tabs={statusTabs} active={status} onChange={onStatus} counts={counts} prefix="status" />
                <FilterRow label="Vector" tabs={typeTabs} active={type} onChange={onType} counts={counts} prefix="type" />
            </div>

            {/* List Counter */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-100/70 px-5 py-2.5 shrink-0">
                <p className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Filtered Incidents ({pins.length})
                </p>
            </div>

            {/* Scrollable Pins Feed */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white min-h-0">
                {pins.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-xs font-semibold text-slate-400">No incident coordinates match the selected parameters.</p>
                    </div>
                ) : (
                    pins.map((pin) => {
                        const Icon = typeIcons[pin.type_icon] || Flame;
                        const sev = pin.severity ?? 'medium';
                        const isSelected = selectedId === pin.id;
                        return (
                            <button
                                key={pin.id}
                                type="button"
                                onClick={() => onSelect(pin.id)}
                                className={cn(
                                    'flex w-full items-start gap-4 p-4 text-left transition-all hover:bg-slate-50 cursor-pointer',
                                    isSelected ? 'bg-blue-50/90 border-l-4 border-blue-600 shadow-inner' : 'bg-white',
                                )}
                            >
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-2xs mt-0.5 border border-slate-200/60"
                                    style={{ backgroundColor: `${severityColors[sev]}15` }}
                                >
                                    <Icon className="h-5 w-5" style={{ color: severityColors[sev] }} />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <p className={cn('text-xs font-extrabold leading-tight line-clamp-2', isSelected ? 'text-blue-950 font-black' : 'text-slate-900')}>
                                        {pin.incident_type}
                                    </p>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">{pin.location_label}</p>
                                    
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        <Badge variant="outline" className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5">
                                            {pin.report_id}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] capitalize font-bold text-slate-600 px-2 py-0.5">
                                            {pin.severity}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className="bg-blue-600 text-[10px] font-bold text-white px-2 py-0.5">Mission Active</Badge>
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
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
            <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer',
                            active === tab.key
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        )}
                    >
                        {tab.label}
                        <span className="ml-1 opacity-75 text-[10px]">({counts[`${prefix}_${tab.key}`] ?? 0})</span>
                    </button>
                ))}
            </div>
        </div>
    );
}