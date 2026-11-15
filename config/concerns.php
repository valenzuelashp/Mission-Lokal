<?php

return [
    'duplicate_distance_meters' => 75,
    // Matching windows are operational defaults; tune them with barangay reviewers.
    'duplicate_window_hours' => 168,
    'topic_window_hours' => [
        'fire' => 24, 'noise' => 24, 'flood' => 72,
        'drainage' => 168, 'waste' => 168, 'streetlight' => 720, 'pothole' => 720,
    ],
];
