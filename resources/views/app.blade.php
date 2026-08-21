<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#0f766e">
        
        <!-- PHASE 9 FIX: Updated path to match the root output directory -->
        <link rel="manifest" href="/build/manifest.webmanifest">
        <link rel="apple-touch-icon" href="/icons/pwa/icon-192.png">
        
        <title inertia>{{ config('app.name', 'Mission-Lokal') }}</title>
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>