import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

// --- CRITICAL FIX: Allow cookies and XSRF tokens to be sent with requests ---
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = (token as HTMLMetaElement).content;
}

// --- AUTOMATIC 419 ERROR RECOVERY INTERCEPTOR ---
axios.interceptors.response.use(
    (response) => response,
    (error) => {
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

// PHASE 9: Native registration pointing to our secure Laravel route
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => console.log('Service Worker Registered Globally!'))
        .catch(err => console.error('SW Registration failed:', err));
}

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#0f766e',
    },
});