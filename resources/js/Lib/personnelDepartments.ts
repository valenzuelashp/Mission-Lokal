import {
    Building2,
    Leaf,
    PawPrint,
    Shield,
    TrafficCone,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

export type PersonnelDepartmentKey =
    | 'traffic_management'
    | 'environmental'
    | 'peace_order'
    | 'utility_infrastructure'
    | 'tambo_animal_response'
    | 'maintenance';

export const personnelDepartments: Record<PersonnelDepartmentKey, {
    label: string;
    description: string;
    icon: LucideIcon;
    image: string;
    heroEyebrow: string;
    heroAccent: string;
    roles: { value: string; label: string }[];
    theme: {
        sidebar: string;
        accent: string;
        accentHover: string;
        soft: string;
        border: string;
        text: string;
        ring: string;
        background: string;
    };
}> = {
    traffic_management: {
        label: 'Traffic Management / Clearing',
        description: 'Road obstructions, traffic control, and safe passage.',
        icon: TrafficCone,
        image: '/images/departments/traffic-management.svg',
        heroEyebrow: 'Keep Tambo moving',
        heroAccent: 'text-amber-200',
        roles: [{ value: 'traffic_control', label: 'Traffic control' }],
        theme: {
            sidebar: 'bg-amber-950 text-amber-50 border-amber-900',
            accent: 'bg-amber-600',
            accentHover: 'hover:bg-amber-700',
            soft: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-800',
            ring: 'selection:bg-amber-100 selection:text-amber-950',
            background: 'bg-amber-50/60',
        },
    },
    environmental: {
        label: 'Environmental',
        description: 'Sanitation, waste collection, and environmental concerns.',
        icon: Leaf,
        image: '/images/departments/environmental.svg',
        heroEyebrow: 'A cleaner, greener barangay',
        heroAccent: 'text-emerald-200',
        roles: [{ value: 'sanitation', label: 'Sanitation' }],
        theme: {
            sidebar: 'bg-emerald-950 text-emerald-50 border-emerald-900',
            accent: 'bg-emerald-700',
            accentHover: 'hover:bg-emerald-800',
            soft: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-800',
            ring: 'selection:bg-emerald-100 selection:text-emerald-950',
            background: 'bg-emerald-50/60',
        },
    },
    peace_order: {
        label: 'Peace & Order',
        description: 'Tanod response, Lupon mediation, and confidential VAW Desk cases.',
        icon: Shield,
        image: '/images/departments/peace-order.svg',
        heroEyebrow: 'Here for a safer community',
        heroAccent: 'text-slate-200',
        roles: [
            { value: 'tanod', label: 'Tanod' },
            { value: 'lupon', label: 'Lupon · Dispute mediation' },
            { value: 'vaw_desk', label: 'VAW Desk · Confidential cases' },
        ],
        theme: {
            sidebar: 'bg-slate-950 text-slate-50 border-slate-800',
            accent: 'bg-slate-800',
            accentHover: 'hover:bg-slate-900',
            soft: 'bg-slate-100',
            border: 'border-slate-300',
            text: 'text-slate-800',
            ring: 'selection:bg-slate-200 selection:text-slate-950',
            background: 'bg-slate-100/70',
        },
    },
    utility_infrastructure: {
        label: 'Utility & Infrastructure',
        description: 'Utility and infrastructure concerns across the barangay.',
        icon: Building2,
        image: '/images/departments/utility-infrastructure.svg',
        heroEyebrow: 'The systems that keep us connected',
        heroAccent: 'text-sky-200',
        roles: [{ value: 'public_works', label: 'Utility & infrastructure' }],
        theme: {
            sidebar: 'bg-sky-950 text-sky-50 border-sky-900',
            accent: 'bg-sky-700',
            accentHover: 'hover:bg-sky-800',
            soft: 'bg-sky-50',
            border: 'border-sky-200',
            text: 'text-sky-800',
            ring: 'selection:bg-sky-100 selection:text-sky-950',
            background: 'bg-sky-50/60',
        },
    },
    tambo_animal_response: {
        label: 'Tambo Animal Response Team',
        description: 'Animal response, welfare, and community safety.',
        icon: PawPrint,
        image: '/images/departments/animal-response.svg',
        heroEyebrow: 'Compassion in every response',
        heroAccent: 'text-violet-200',
        roles: [{ value: 'animal_response', label: 'Animal responder' }],
        theme: {
            sidebar: 'bg-violet-950 text-violet-50 border-violet-900',
            accent: 'bg-violet-700',
            accentHover: 'hover:bg-violet-800',
            soft: 'bg-violet-50',
            border: 'border-violet-200',
            text: 'text-violet-800',
            ring: 'selection:bg-violet-100 selection:text-violet-950',
            background: 'bg-violet-50/60',
        },
    },
    maintenance: {
        label: 'Maintenance',
        description: 'Electrical, drainage, and minor infrastructure repairs.',
        icon: Wrench,
        image: '/images/departments/maintenance.svg',
        heroEyebrow: 'Small repairs. Stronger neighborhoods.',
        heroAccent: 'text-orange-200',
        roles: [{ value: 'maintenance', label: 'Maintenance technician' }],
        theme: {
            sidebar: 'bg-orange-950 text-orange-50 border-orange-900',
            accent: 'bg-orange-700',
            accentHover: 'hover:bg-orange-800',
            soft: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-800',
            ring: 'selection:bg-orange-100 selection:text-orange-950',
            background: 'bg-orange-50/60',
        },
    },
};

export const personnelDepartmentOptions = Object.entries(personnelDepartments).map(([value, department]) => ({
    value: value as PersonnelDepartmentKey,
    label: department.label,
}));
