export type AnswerBasis = 'barangay' | 'general' | 'mixed' | 'clarification' | 'restricted';

export interface HelpSource {
    id: string;
    title: string;
    url: string;
    updated_at: string | null;
}

export interface HelpMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    basis?: AnswerBasis;
    sources?: HelpSource[];
    status?: 'answered' | 'degraded' | 'unavailable';
    notice?: string | null;
}

interface HelpResponse {
    messages: HelpMessage[];
    reply?: HelpMessage;
    csrfToken?: string;
}

export class HelpRequestError extends Error {
    constructor(message: string, public readonly code: 'session' | 'validation' | 'limit' | 'service') {
        super(message);
        this.name = 'HelpRequestError';
    }
}

export async function requestHelp(
    method: 'GET' | 'POST' | 'DELETE',
    payload: Record<string, unknown>,
    csrfToken: string,
    signal?: AbortSignal,
): Promise<HelpResponse> {
    const response = await fetch('/help', {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken,
        },
        body: method === 'GET' ? undefined : JSON.stringify(payload),
        signal,
    });
    if (response.redirected || response.status === 401 || response.status === 419) {
        throw new HelpRequestError('Your session has expired. Sign in again or reload this page before retrying.', 'session');
    }
    if (response.status === 403) {
        throw new HelpRequestError('Your account cannot access Barangay Help right now. Check your sign-in and resident verification.', 'session');
    }
    if (response.status === 429) {
        throw new HelpRequestError('You have sent several questions recently. Please wait a minute before trying again.', 'limit');
    }
    if (! response.headers.get('content-type')?.includes('application/json')) {
        throw new HelpRequestError('Barangay Help could not complete the request. Please retry shortly.', 'service');
    }
    const result = await response.json().catch(() => null);
    if (response.status === 422) {
        throw new HelpRequestError(result?.errors?.question?.[0] ?? 'Please check your question and try again.', 'validation');
    }
    // A degraded answer can still contain useful, safely labeled guidance.
    if (Array.isArray(result?.messages) && (response.ok || response.status === 503)) {
        return result;
    }
    throw new HelpRequestError(
        result?.error?.code === 'records_unavailable'
            ? 'Published records or your session cannot be loaded right now. Please retry shortly.'
            : 'Barangay Help could not complete the request. Please retry shortly.',
        'service',
    );
}

export function trustedSourceUrl(url: string): boolean {
    return url === '/documents' || /^\/library#library-[a-zA-Z0-9-]+$/.test(url);
}
