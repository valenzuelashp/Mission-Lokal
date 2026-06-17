import { usePage } from '@inertiajs/react';

export function useActivePath() {
    const { url } = usePage();
    const path = url.split('?')[0];

    const isActive = (href: string) => {
        if (href === '/feed') return path === '/feed' || path === '/';
        if (href === '/admin') return path === '/admin';
        return path === href || path.startsWith(`${href}/`);
    };

    return { path, isActive };
}
