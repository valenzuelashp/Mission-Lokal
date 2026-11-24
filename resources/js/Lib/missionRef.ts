export function missionRef(id: string): string {
    return `MS-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

export function missionQueueHref(row: { id: string; concern_id?: string; has_mission?: boolean }): string {
    if (row.has_mission === false && row.concern_id) {
        return `/admin/reports/${row.concern_id}`;
    }

    return `/admin/missions/${row.id.replace('#', '')}`;
}
