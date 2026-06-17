<?php

namespace App\Http\Controllers\Personnel;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = [
            [
                'id' => 'n1',
                'title' => 'New mission assigned',
                'body' => 'MS-8888 Illegal dumping cleanup — due Jun 19, 3:00 PM. Market rear alley.',
                'sent_at' => '2 hours ago',
                'read' => false,
                'mission_id' => 'MS-8888',
            ],
            [
                'id' => 'n2',
                'title' => 'ACK reminder',
                'body' => 'MS-8880 VAWC welfare check is overdue for acknowledgment. Respond within 4 hours.',
                'sent_at' => '5 hours ago',
                'read' => false,
                'mission_id' => 'MS-8880',
            ],
            [
                'id' => 'n3',
                'title' => 'Mission update',
                'body' => 'Admin approved your proof for MS-8870 Street light repair. Mission verified.',
                'sent_at' => 'Yesterday',
                'read' => true,
                'mission_id' => 'MS-8870',
            ],
            [
                'id' => 'n4',
                'title' => 'SMS mirror',
                'body' => '[Mission-Lokal] Assigned: MS-8902 Clogged drainage. Location: Mabini St. Reply ACK to confirm.',
                'sent_at' => 'Jun 17, 8:05 AM',
                'read' => true,
                'mission_id' => 'MS-8902',
            ],
        ];

        $unread = count(array_filter($notifications, fn ($n) => ! $n['read']));

        return Inertia::render('Personnel/Notifications', [
            'notifications' => $notifications,
            'unread_count' => $unread,
        ]);
    }
}
