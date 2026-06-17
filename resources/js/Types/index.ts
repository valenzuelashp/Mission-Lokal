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
}

export interface MapPin {
    id: string;
    lat: number;
    lng: number;
    title: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
