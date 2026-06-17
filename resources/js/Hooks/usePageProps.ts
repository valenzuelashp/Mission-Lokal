import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/Types';

export function usePageProps() {
    return usePage<PageProps>().props;
}

export function useAuth() {
    return usePageProps().auth;
}
