export type UserRole = 'resident' | 'personnel' | 'admin' | 'super_admin';

export type VerificationStatus =
    | 'pending'
    | 'in_progress'
    | 'approved'
    | 'rejected';

export interface User {
    id: string;
    account_id: string;
    role: UserRole;
    email?: string;
    mobile?: string;
    verification_status: VerificationStatus;
    civic_xp: number;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export interface MapPin {
    id: string;
    lat: number;
    lng: number;
    title: string;
    severity?: Severity;
}

export type MapPinStatus = 'active' | 'pending' | 'resolved';

export type IncidentTypeIcon = 'fire' | 'flood' | 'waste' | 'noise' | 'drainage' | 'light';

export interface AdminMapPin extends MapPin {
    report_id: string;
    concern_id: string;
    location_label: string;
    type_icon: IncidentTypeIcon;
    incident_type: string;
    status: MapPinStatus;
    has_mission: boolean;
    mission_id?: string;
    ai_severity: number;
}

export interface AdminMapHotspot {
    id: string;
    lat: number;
    lng: number;
    radius_m: number;
    label: string;
    report_count: number;
    risk_level: 'high' | 'medium' | 'low';
}

export interface AdminMapPageProps extends PageProps {
    pins: AdminMapPin[];
    hotspots: AdminMapHotspot[];
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ConcernStatus =
    | 'submitted'
    | 'ai_processed'
    | 'under_review'
    | 'active'
    | 'resolved'
    | 'closed';

export interface PublicConcern {
    id: string;
    title: string;
    category: string;
    severity: Severity;
    status: ConcernStatus;
    vote_count: number;
    location_label: string;
    created_at: string;
    user_vote?: 'up' | 'down' | null;
    has_voted?: boolean;
}

export interface FeedPageProps extends PageProps {
    concerns: PublicConcern[];
}

export interface ResidentAnnouncement {
    id: string;
    title: string;
    body: string;
    image_url?: string | null;
    published_at: string;
    author_name: string;
}

export interface AnnouncementsPageProps extends PageProps {
    announcements: ResidentAnnouncement[];
}

export interface AnnouncementShowPageProps extends PageProps {
    announcement: ResidentAnnouncement;
}

export interface ResidentProfileData {
    full_name: string;
    address: string;
    birthday: string;
    digital_id_code: string | null;
    member_since: string;
    badges: { id: string; name: string; earned_at: string }[];
    report_count: number;
}

export interface ProfilePageProps extends PageProps {
    profile?: ResidentProfileData;
}

export type BlotterType = 'two-party' | 'one-party';

export interface BlotterFormPageProps extends PageProps {
    blotterType: BlotterType;
}

export interface LibraryManual {
    id: string;
    title: string;
    subtitle: string;
    icon: 'flood' | 'earthquake' | 'fire';
    body: string;
}

export interface LibraryContact {
    id: string;
    name: string;
    role: string;
    phone: string;
    icon: 'office' | 'fire' | 'health' | 'police';
    emergency?: boolean;
}

export interface LibraryPageProps extends PageProps {
    manuals: LibraryManual[];
    contacts: LibraryContact[];
}

export interface ConcernDetail extends PublicConcern {
    lat: number;
    lng: number;
    description: string;
    timeline: { key: string; label: string; description?: string; at?: string; state: 'done' | 'current' | 'upcoming' }[];
}

export interface ConcernShowPageProps extends PageProps {
    concern: ConcernDetail;
}

export interface NewConcernPageProps extends PageProps {
    categories: { value: string; label: string }[];
    mapCenter: [number, number];
}

export interface AdminDashboardStats {
    total_reports: number;
    ongoing_missions: number;
    accomplished: number;
    pending_verification: number;
}

export interface AdminIncident {
    id: string;
    concern_id: string;
    incident_type: string;
    type_icon: 'fire' | 'flood' | 'waste' | 'noise' | 'drainage' | 'light';
    location: string;
    ai_severity: number;
    priority: 'high' | 'med' | 'low';
    status: 'ongoing' | 'seen' | 'done';
}

export interface AdminReport extends AdminIncident {
    ai_category: string;
    visibility: 'public' | 'private';
    queue_status: 'ai_processed' | 'under_review' | 'active' | 'rejected' | 'spam';
    submitted_at: string;
}

export interface AdminReportQueuePageProps extends PageProps {
    reports: AdminReport[];
    counts: Record<string, number>;
}

export type MissionStatus =
    | 'assigned'
    | 'acknowledged'
    | 'in_progress'
    | 'completed'
    | 'verified'
    | 'cancelled';

export interface AdminMission {
    id: string;
    concern_id: string;
    concern_title: string;
    location: string;
    assignee: string | null;
    priority: 'high' | 'med' | 'low';
    status: MissionStatus;
    due_date: string;
    is_overdue?: boolean;
    is_escalated?: boolean;
}

export interface AdminMissionQueuePageProps extends PageProps {
    missions: AdminMission[];
    counts: Record<string, number>;
}

export interface PersonnelChecklistItem {
    id: string;
    label: string;
    done: boolean;
}

export interface PersonnelMission {
    id: string;
    concern_id: string;
    title: string;
    location: string;
    lat: number;
    lng: number;
    priority: 'high' | 'med' | 'low';
    status: MissionStatus;
    due_date: string;
    is_overdue?: boolean;
    visibility: 'public' | 'private';
    brief: string;
    checklist: PersonnelChecklistItem[];
    reporter_name?: string | null;
    reporter_phone?: string | null;
    assigned_at: string;
    proof_notes?: string | null;
    proof_photos?: string[];
    proof_submitted?: boolean;
}

export interface PersonnelMissionsPageProps extends PageProps {
    missions: PersonnelMission[];
    counts: Record<string, number>;
}

export interface PersonnelMissionPageProps extends PageProps {
    mission: PersonnelMission;
}

export interface PersonnelNotification {
    id: string;
    title: string;
    body: string;
    sent_at: string;
    read: boolean;
    mission_id?: string | null;
}

export interface PersonnelNotificationsPageProps extends PageProps {
    notifications: PersonnelNotification[];
    unread_count: number;
}

export interface AdminActivity {
    id: string;
    title: string;
    time: string;
    icon: 'user' | 'ai' | 'success' | 'system';
}

export interface AdminDashboardPageProps extends PageProps {
    stats: AdminDashboardStats;
    incidents: AdminIncident[];
    activities: AdminActivity[];
    map_pins: MapPin[];
}

export interface AdminAnnouncement {
    id: string;
    title: string;
    body: string;
    image_url?: string | null;
    is_published: boolean;
    published_at: string | null;
    author_name: string;
    created_at: string;
    updated_at: string;
}

export interface AdminAnnouncementsPageProps extends PageProps {
    announcements: AdminAnnouncement[];
    counts: Record<string, number>;
}

export interface AdminAnnouncementFormPageProps extends PageProps {
    announcement?: AdminAnnouncement;
}

export interface AdminResident {
    id: string;
    account_id: string;
    full_name: string;
    email: string | null;
    mobile: string | null;
    address: string;
    verification_status: VerificationStatus;
    civic_xp: number;
    report_count: number;
    badge_count: number;
    digital_id_code: string | null;
    joined_at: string;
}

export interface AdminResidentBadge {
    id: string;
    name: string;
    description: string;
    earned_at: string;
}

export interface AdminResidentReport {
    id: string;
    concern_id: string;
    title: string;
    category: string;
    status: ConcernStatus;
    visibility: 'public' | 'private';
    submitted_at: string;
}

export interface AdminResidentXpEvent {
    id: string;
    reason: string;
    amount: number;
    at: string;
}

export interface AdminResidentActivity {
    id: string;
    date: string;
    type: 'mission' | 'broadcast' | 'blotter';
    description: string;
    status: 'resolved' | 'acknowledged' | 'complete' | 'pending' | 'active';
}

export interface AdminResidentDocument {
    id: string;
    name: string;
    meta: string;
    size: string;
    status: 'verified' | 'pending' | 'updated';
}

export interface AdminResidentEmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface AdminResidentDetail extends AdminResident {
    birthday: string;
    age_years: number | null;
    national_id_masked: string | null;
    citizenship_status: string;
    gender: string;
    zip_code: string | null;
    map_lat: number;
    map_lng: number;
    emergency_contact: AdminResidentEmergencyContact | null;
    badges: AdminResidentBadge[];
    reports: AdminResidentReport[];
    xp_events: AdminResidentXpEvent[];
    activities: AdminResidentActivity[];
    documents: AdminResidentDocument[];
}

export interface AdminResidentsPageProps extends PageProps {
    residents: AdminResident[];
    counts: Record<string, number>;
}

export interface AdminResidentShowPageProps extends PageProps {
    resident?: AdminResidentDetail;
}
