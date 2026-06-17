import type { PersonnelMission } from '@/Types';

export const demoPersonnelMissions: PersonnelMission[] = [
    {
        id: 'MS-8902',
        concern_id: 'c1',
        title: 'Clogged drainage on Mabini St.',
        location: 'Mabini St. corner Rizal Ave.',
        lat: 14.6012,
        lng: 120.9821,
        priority: 'high',
        status: 'in_progress',
        due_date: 'Jun 18, 5:00 PM',
        visibility: 'public',
        brief: 'Clear debris from the drainage grate and verify water flow after rain.',
        checklist: [
            { id: 'ck1', label: 'Inspect drainage inlet and note blockages', done: true },
            { id: 'ck2', label: 'Remove visible debris and waste', done: true },
            { id: 'ck3', label: 'Test water flow with hose or wait for rain', done: false },
            { id: 'ck4', label: 'Photo-document before and after', done: false },
        ],
        reporter_name: 'Juan Dela Cruz',
        reporter_phone: '09191234567',
        assigned_at: 'Jun 17, 8:00 AM',
        proof_submitted: false,
    },
];

export function personnelMissionCounts(missions: PersonnelMission[]) {
    return {
        all: missions.length,
        active: missions.filter((m) => ['assigned', 'acknowledged', 'in_progress'].includes(m.status)).length,
        assigned: missions.filter((m) => m.status === 'assigned').length,
        acknowledged: missions.filter((m) => m.status === 'acknowledged').length,
        in_progress: missions.filter((m) => m.status === 'in_progress').length,
        completed: missions.filter((m) => ['completed', 'verified'].includes(m.status)).length,
        overdue: missions.filter(
            (m) => m.is_overdue && !['completed', 'verified', 'cancelled'].includes(m.status),
        ).length,
    };
}
