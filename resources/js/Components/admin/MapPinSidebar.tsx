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
        <div className="flex h-full flex-col rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden">
            <div className="border-b border-neutral-100 p-4 bg-white/40">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-800">Filter parameters</h3>
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search location parameters..."
                        className="pl-8.5 h-9 rounded-xl border-neutral-200 bg-white/50 text-xs font-bold shadow-2xs focus:bg-white placeholder-neutral-400 focus:border-neutral-900 focus:ring-neutral-900"
                    />
                </div>
                <label className="mt-3.5 flex cursor-pointer items-center gap-2.5 text-xs font-bold text-neutral-700 select-none">
                    <input
                        type="checkbox"
                        checked={showHotspots}
                        onChange={onToggleHotspots}
                        className="h-4 w-4 rounded-md border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    Display mapped risk vectors
                </label>
            </div>

            <div className="space-y-4 border-b border-neutral-100 p-4 max-h-[40vh] overflow-y-auto bg-neutral-50/20">
                <FilterRow label="Severity framework" tabs={severityTabs} active={severity} onChange={onSeverity} counts={counts} prefix="sev" />
                <FilterRow label="Workflow status" tabs={statusTabs} active={status} onChange={onStatus} counts={counts} prefix="status" />
                <FilterRow label="Incident Classification" tabs={typeTabs} active={type} onChange={onType} counts={counts} prefix="type" />
            </div>

            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 bg-white/40">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Active vectors Live (<span className="text-neutral-800 tabular-nums">{pins.length}</span>)
                </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
                {pins.length === 0 ? (
                    <p className="p-6 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">No nodes selected.</p>
                ) : (
                    pins.map((pin) => {
                        const Icon = typeIcons[pin.type_icon];
                        const sev = pin.severity ?? 'medium';
                        const isSelected = selectedId === pin.id;
                        return (
                            <button
                                key={pin.id}
                                type="button"
                                onClick={() => onSelect(pin.id)}
                                className={cn(
                                    'flex w-full gap-3.5 px-4 py-3.5 text-left transition-all duration-200 outline-none',
                                    isSelected 
                                        ? 'bg-neutral-900 text-white border-y-neutral-950' 
                                        : 'bg-transparent hover:bg-neutral-50/50 text-neutral-800',
                                )}
                            >
                                <div
                                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs"
                                    style={{ 
                                        backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : `${severityColors[sev]}12`,
                                        borderColor: isSelected ? 'rgba(255,255,255,0.2)' : `${severityColors[sev]}30`
                                    }}
                                >
                                    <Icon className="h-4 w-4 stroke-[2]" style={{ color: isSelected ? '#ffffff' : severityColors[sev] }} />
                                </div>
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className={cn("text-xs font-black tracking-tight truncate", isSelected ? "text-white" : "text-neutral-900")}>
                                        {pin.incident_type}
                                    </p>
                                    <p className={cn("text-[11px] font-medium truncate leading-tight", isSelected ? "text-neutral-400" : "text-neutral-400")}>
                                        {pin.location_label}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <Badge variant="outline" className={cn("rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider", isSelected ? "border-neutral-700 bg-neutral-800 text-neutral-300" : "border-neutral-200 bg-white text-neutral-400")}>
                                            {pin.report_id}
                                        </Badge>
                                        {pin.has_mission && (
                                            <Badge className={cn("rounded-md px-1.5 py-0 text-[9px] font-black uppercase tracking-wider shadow-2xs border-transparent", isSelected ? "bg-white text-neutral-900" : "bg-neutral-900 text-white")}>
                                                Operations Active
                                            </Badge>
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
        <div className="space-y-1.5">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">{label}</p>
            <div className="flex flex-wrap gap-1">
                {tabs.map((tab) => {
                    const isActive = active === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onChange(tab.key)}
                            className={cn(
                                'rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-2xs transition-all active:scale-95',
                                isActive
                                    ? 'bg-neutral-900 border-transparent text-white'
                                    : 'bg-white border-neutral-200/80 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300',
                            )}
                        >
                            {tab.label}
                            <span className={cn('ml-1 font-bold opacity-60 tabular-nums', isActive && 'opacity-90')}>
                                ({counts[`${prefix}_${tab.key}`] ?? 0})
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}