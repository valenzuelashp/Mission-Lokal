<?php

return [

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.1-pro-preview'),
        'chat_model' => env('GEMINI_CHAT_MODEL', env('GEMINI_MODEL', 'gemini-3.1-pro-preview')),
    ],

];