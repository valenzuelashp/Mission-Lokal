<?php

return [

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.6-flash'),
        'chat_model' => env('GEMINI_CHAT_MODEL', env('GEMINI_MODEL', 'gemini-3.6-flash')),
    ],

];