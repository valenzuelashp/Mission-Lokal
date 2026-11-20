<?php

return [

    'geocoding' => [
        'nominatim_url' => env('NOMINATIM_URL', 'https://nominatim.openstreetmap.org/reverse'),
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.1-pro-preview'),
        'chat_model' => env('GEMINI_CHAT_MODEL', env('GEMINI_MODEL', 'gemini-3.1-pro-preview')),
        'chat_max_output_tokens' => (int) env('GEMINI_CHAT_MAX_OUTPUT_TOKENS', 4096),
        'chat_timeout' => (int) env('GEMINI_CHAT_TIMEOUT', 20),
    ],

    'sms' => [
        'driver' => env('SMS_DRIVER', env('SMS_GATEWAY', 'log')),
        'iprog' => [
            'api_token' => env('IPROG_API_TOKEN'),
        ],
    ],
];
