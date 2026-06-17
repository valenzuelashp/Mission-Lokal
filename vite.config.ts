import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icons/pwa/*.png'],
            manifest: {
                name: 'Mission-Lokal',
                short_name: 'Mission-Lokal',
                description: 'Barangay concern and response management',
                theme_color: '#0f766e',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/feed',
                icons: [
                    {
                        src: '/icons/pwa/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                runtimeCaching: [
                    {
                        urlPattern: /^\/library/,
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'library-cache' },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
});
