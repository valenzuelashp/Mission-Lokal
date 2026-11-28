export type WorkLocationSource = 'onsite_gps' | 'mission_location' | 'manual';

export interface PersonnelProofDraft {
    missionId: string;
    clientSubmissionId: string;
    notes: string;
    photos: File[];
    latitude: string;
    longitude: string;
    locationAccuracyM: string;
    workLocation: string;
    workLocationSource: WorkLocationSource;
    locationNote: string;
    queuedForUpload: boolean;
    savedAt: number;
}

const databaseName = 'mission-lokal-personnel-proof';
const storeName = 'drafts';
let databaseRequest: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
    if (!('indexedDB' in window)) {
        return Promise.reject(new Error('This browser does not support offline proof drafts.'));
    }

    if (!databaseRequest) {
        databaseRequest = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(databaseName, 1);
            request.onupgradeneeded = () => {
                if (!request.result.objectStoreNames.contains(storeName)) {
                    request.result.createObjectStore(storeName, { keyPath: 'missionId' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error ?? new Error('Could not open offline proof storage.'));
        });
    }

    return databaseRequest;
}

export async function savePersonnelProofDraft(draft: PersonnelProofDraft): Promise<void> {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put(draft);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Could not save the offline proof draft.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Offline proof draft storage was interrupted.'));
    });
}

export async function loadPersonnelProofDraft(missionId: string): Promise<PersonnelProofDraft | null> {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readonly');
        const request = transaction.objectStore(storeName).get(missionId);
        let draft: PersonnelProofDraft | null = null;
        request.onsuccess = () => {
            draft = (request.result as PersonnelProofDraft | undefined) ?? null;
        };
        request.onerror = () => reject(request.error ?? new Error('Could not load the offline proof draft.'));
        transaction.oncomplete = () => resolve(draft);
        transaction.onerror = () => reject(transaction.error ?? new Error('Could not load the offline proof draft.'));
    });
}

export async function deletePersonnelProofDraft(missionId: string): Promise<void> {
    const database = await openDatabase();

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).delete(missionId);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Could not clear the uploaded proof draft.'));
        transaction.onabort = () => reject(transaction.error ?? new Error('Could not clear the uploaded proof draft.'));
    });
}
