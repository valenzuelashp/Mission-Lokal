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
        author_name: a.author_name,
    }));

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
        title: 'Two-party dispute',
        description: 'Complaint against another person — mediation at the barangay hall after admin approval.',
        examples: 'Neighbor dispute, property boundary, debt',
    },
    {
        type: 'one-party' as const,
        title: 'One-party report',
        description: 'Log an incident for barangay records — may trigger a search or welfare mission.',
        examples: 'Missing person appeal, welfare check, lost property',
    },
];

export const libraryManuals = [
    {
        id: 'manual-flood',
        title: 'Flood Preparedness',
        subtitle: 'Emergency bag checklist & evacuation routes',
        icon: 'flood' as const,
        body: 'Pack a go-bag with water, non-perishable food, flashlight, and copies of IDs. Know your barangay evacuation route and the nearest designated center. Move valuables to higher ground when advisories are raised.',
    },
    {
        id: 'manual-earthquake',
        title: 'Earthquake Safety',
        subtitle: 'Drop, Cover, and Hold on protocols',
        icon: 'earthquake' as const,
        body: 'During shaking: drop to the ground, take cover under sturdy furniture, and hold on. After shaking stops, check for injuries and hazards before evacuating. Avoid elevators and damaged structures.',
    },
    {
        id: 'manual-fire',
        title: 'Fire Prevention',
        subtitle: 'Home safety audit and extinguisher guide',
        icon: 'fire' as const,
        body: 'Inspect wiring, keep extinguishers accessible, and never block exits. If a fire starts, alert others, use an extinguisher only if safe, and evacuate immediately. Call the local fire station once you are outside.',
    },
];

export const libraryContacts = [
    {
        id: 'contact-captain',
        name: 'Brgy. Captain - Office',
        role: 'Community Head',
        phone: '09171234567',
        icon: 'office' as const,
    },
    {
        id: 'contact-fire',
        name: 'Local Fire Station',
        role: 'Fire & Rescue',
        phone: '09189876543',
        icon: 'fire' as const,
        emergency: true,
    },
    {
        id: 'contact-health',
        name: 'Municipal Health Center',
        role: 'Medical Aid',
        phone: '09175551234',
        icon: 'health' as const,
    },
    {
        id: 'contact-pnp',
        name: 'PNP Sub-Station',
        role: 'Public Safety',
        phone: '09179998877',
        icon: 'police' as const,
    },
    {
        id: 'contact-hall',
        name: 'Barangay Hall Desk',
        role: 'General inquiries',
        phone: '028881234',
        icon: 'office' as const,
    },
    {
        id: 'contact-mdrrmo',
        name: 'MDRRMO Hotline',
        role: 'Disaster response',
        phone: '09171112233',
        icon: 'health' as const,
        emergency: true,
    },
];
