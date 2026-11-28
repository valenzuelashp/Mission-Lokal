import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { type ComponentType, type ReactElement } from 'react';
import { ResidentThemeProvider } from '@/Layouts/ResidentThemeContext';
import axios from 'axios';
import { applyStoredTheme } from '@/Components/shared/ThemeToggle';
import { getResidentTheme } from '@/Lib/residentThemes';
import { router } from '@inertiajs/react';
import SessionSecurityBoundary, { type SessionSecurityAuth } from '@/Components/shared/SessionSecurityBoundary';

function applyRouteTheme(component?: string) {
    if (!component) return;

    if (component.startsWith('Resident/')) {
        const residentTheme = getResidentTheme();
        document.documentElement.dataset.residentTheme = residentTheme.id;
        document.documentElement.classList.remove('dark');
        return;
    }

    if (component.startsWith('Auth/') || component === 'Legal/Privacy') {
        document.documentElement.classList.remove('dark');
        return;
    }

    applyStoredTheme();
}

applyStoredTheme();

router.on('start', () => document.documentElement.setAttribute('data-navigation-loading', 'true'));
router.on('finish', () => document.documentElement.removeAttribute('data-navigation-loading'));
router.on('success', (event) => {
    applyRouteTheme(event.detail.page.component);
});

// --- CRITICAL FIX: Allow cookies and XSRF tokens to be sent with requests ---
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// --- AUTOMATIC 419 ERROR RECOVERY INTERCEPTOR ---
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 423) window.dispatchEvent(new Event('session-locked'));
        if (error.response?.status === 401 && ['session_revoked', 'session_expired'].includes(error.response?.data?.code)) window.dispatchEvent(new Event('session-revoked'));
        if (error.response && error.response.status === 419) {
            // Silently reload the window to obtain a fresh CSRF token and session
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// PHASE 9: Import the Service Worker registration
// @ts-expect-error: virtual:pwa-register is provided by vite-plugin-pwa at build time.
import { registerSW } from 'virtual:pwa-register';

const appName = import.meta.env.VITE_APP_NAME || 'Mission-Lokal';
const securedPages = new Map<string, { default: ComponentType<any> }>();

// PHASE 9: Native registration pointing to our secure Laravel route
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => console.log('Service Worker Registered Globally!'))
        .catch(err => console.error('SW Registration failed:', err));
}

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: async (name) => {
        const cached = securedPages.get(name);
        if (cached) return cached;
        const page = await resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx'),
        );
        const Page = page.default as ComponentType<any>;
        const SecuredPage = (pageProps: Record<string, unknown>) => name.startsWith('Resident/')
            ? <ResidentThemeProvider><Page {...pageProps} /></ResidentThemeProvider>
            : <Page {...pageProps} />;
        // Inertia preserves layouts across visits. Keep security state and listeners alive when only the page changes.
        SecuredPage.layout = (pageElement: ReactElement<{ auth?: SessionSecurityAuth }>) => {
            const auth = pageElement.props.auth;
            return <SessionSecurityBoundary key={`${auth?.user?.id ?? 'guest'}:${auth?.session_security?.context ?? 'legacy'}`}
                auth={auth} lockPage={name === 'Auth/SessionLock'}>{pageElement}</SessionSecurityBoundary>;
        };
        const secured = {
            ...page,
            default: SecuredPage,
        };
        securedPages.set(name, secured);
        return secured;
    },
    setup({ el, App, props }) {
        applyRouteTheme(props.initialPage?.component);
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#0f766e',
    },
});

router.on('invalid', (event) => {
    if (event.detail.response.status === 423) { event.preventDefault(); window.dispatchEvent(new Event('session-locked')); }
});
