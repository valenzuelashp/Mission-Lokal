import { router } from '@inertiajs/react';
import type { KeyboardEvent, SyntheticEvent } from 'react';

export function visitHref(href: string) {
    router.visit(href);
}

export function rowNavProps(href: string | null | undefined) {
    if (!href) {
        return {};
    }

    return {
        role: 'link' as const,
        tabIndex: 0,
        onClick: () => visitHref(href),
        onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                visitHref(href);
            }
        },
    };
}

export function stopRowNav(event: SyntheticEvent) {
    event.stopPropagation();
}
