export type AnalyticsRange = '7' | '30' | '90' | 'custom';

export interface AnalyticsSummary {
    reports_received: number;
    missions_created: number;
    missions_verified: number;
    average_verification_hours: number | null;
}

export interface DepartmentWorkload {
    as_of: string;
    totals: { active: number; overdue: number; awaiting_verification: number };
    departments: { name: string; active: number; overdue: number; awaiting_verification: number; total: number }[];
}

export interface DashboardAnalyticsData {
    hotspots: {
        totals: { reports: number; incidents: number; named_areas: number; unnamed_reports: number };
        rows: {
            key: string; area: string; category: string; topic: string;
            reports: number; incidents: number; unique_reporters: number; open_incidents: number;
            last_reported_at: string | null;
        }[];
    };
    period: {
        range: AnalyticsRange;
        start: string;
        end: string;
        today: string;
        timezone: string;
    };
    summary: AnalyticsSummary;
    comparison: { period: { start: string; end: string }; summary: AnalyticsSummary };
    workload: DepartmentWorkload;
    trend: { date: string; reports: number; verified: number }[];
    statuses: { status: string; count: number }[];
    categories: { name: string; count: number }[];
    severities: { severity: string; count: number }[];
}
