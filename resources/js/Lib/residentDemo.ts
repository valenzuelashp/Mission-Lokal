import { demoAnnouncements } from '@/Lib/adminDemo';
import type { ResidentAnnouncement, ResidentProfileData } from '@/Types';

export const publishedAnnouncements: ResidentAnnouncement[] = demoAnnouncements
    .filter((a) => a.is_published && a.published_at)
    .map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        image_url: a.image_url,
        published_at: a.published_at!,
        author_name: a.author_name ?? 'Barangay Official',
        volunteer_count: a.volunteer_count ?? 0,
    })) as ResidentAnnouncement[];

export function findPublishedAnnouncement(id: string): ResidentAnnouncement | undefined {
    return publishedAnnouncements.find((a) => a.id === id);
}

export const demoResidentProfile: ResidentProfileData = {
    full_name: 'Juan Dela Cruz',
    address: 'Block 3, Phase 2, Barangay Demo',
    birthday: 'Mar 14, 1990',
    digital_id_code: 'BL-2024-00421',
    member_since: 'Jan 12, 2024',
    report_count: 3,
    badges: [
        { id: 'b1', name: 'First Reporter', earned_at: 'Jan 2024' },
        { id: 'b2', name: 'Community Voice', earned_at: 'Apr 2024' },
        { id: 'b3', name: 'Flood Watcher', earned_at: 'Aug 2024' },
    ],
};

export const blotterTypes = [
    {
        type: 'two-party' as const,
        title: 'Two-Party Dispute',
        description: 'Complaint against another community resident — official mediation scheduled at the barangay hall after staff review.',
        examples: 'Neighbor boundary dispute, noise complaints, monetary obligations, etc.',
    },
    {
        type: 'one-party' as const,
        title: 'One-Party Official Incident Report',
        description: 'Log an incident for official barangay records or request field investigation assistance.',
        examples: 'Missing property, structural hazards, hazard logs.',
    },
];

export const libraryManuals = [
    {
        id: 'manual-flood',
        title: 'Flood Preparedness Protocol',
        subtitle: 'Emergency Go-Bag checklist & evacuation routes',
        icon: 'flood' as const,
        body: '1. Prepare a waterproof Go-Bag containing drinking water, non-perishable food, flashlight, first-aid kit, and digital IDs.\n2. Know your designated evacuation center (Barangay Covered Court).\n3. Elevate household appliances and electrical cables before storm surges occur.',
    },
    {
        id: 'manual-earthquake',
        title: 'Earthquake Safety & Evacuation',
        subtitle: 'Drop, Cover, and Hold on standard operational guide',
        icon: 'earthquake' as const,
        body: 'During severe ground shaking:\n• DROP to your hands and knees.\n• COVER your head and neck under sturdy furniture.\n• HOLD ON until shaking stops completely.\nEvacuate calmly once tremors subside; avoid utility poles and glass facades.',
    },
    {
        id: 'manual-fire',
        title: 'Fire Prevention & Response',
        subtitle: 'Home safety audit and emergency extinguisher operation',
        icon: 'fire' as const,
        body: 'Check LPG tanks and electrical wiring regularly. Keep fire exits unblocked. In case of fire: sound the alarm, evacuate immediately, close doors behind you to slow fire spread, and call the municipal emergency hotline.',
    },
];

export const libraryContacts = [
    {
        id: 'contact-captain',
        name: 'Barangay Captain Office',
        role: 'Executive Administrator',
        phone: '09171234567',
        icon: 'office' as const,
    },
    {
        id: 'contact-fire',
        name: 'Municipal Fire Station',
        role: 'Emergency Fire & Rescue',
        phone: '09189876543',
        icon: 'fire' as const,
        emergency: true,
    },
    {
        id: 'contact-health',
        name: 'Barangay Health Center (BHS)',
        role: 'Medical Assistance & Immunization',
        phone: '09175551234',
        icon: 'health' as const,
    },
    {
        id: 'contact-pnp',
        name: 'PNP Police Sub-Station',
        role: 'Law Enforcement & Order',
        phone: '09179998877',
        icon: 'police' as const,
        emergency: true,
    },
    {
        id: 'contact-hall',
        name: 'Barangay Operations Desk',
        role: 'General Inquiries & Clearances',
        phone: '028881234',
        icon: 'office' as const,
    },
    {
        id: 'contact-mdrrmo',
        name: 'MDRRMO Disaster Hotline',
        role: 'Disaster Risk Reduction Unit',
        phone: '09171112233',
        icon: 'health' as const,
        emergency: true,
    },
];