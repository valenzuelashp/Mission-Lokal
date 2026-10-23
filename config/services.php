<?php

return [

    'geocoding' => [
        'nominatim_url' => env('NOMINATIM_URL', 'https://nominatim.openstreetmap.org/reverse'),
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.1-pro-preview'),
        'chat_model' => env('GEMINI_CHAT_MODEL', env('GEMINI_MODEL', 'gemini-3.1-pro-preview')),
    ],

    'sms' => [
        'driver' => env('SMS_DRIVER', env('SMS_GATEWAY', 'log')),
        'iprog' => [
            'api_token' => env('IPROG_API_TOKEN'),
        ],
    ],
];