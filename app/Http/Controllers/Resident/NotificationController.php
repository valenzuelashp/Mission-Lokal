<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Fetch notifications belonging to this resident, newest first
        $notificationsDb = Notification::where('user_id', $user->id)
            ->latest('created_at')
            ->get();

        // 2. Format the data for React
        $notifications = $notificationsDb->map(function ($notif) {
            // Extract IDs from the JSON payload for deep linking
            $payload = is_array($notif->payload) ? $notif->payload : json_decode($notif->payload ?? '{}', true);
            
            return [
                'id' => $notif->id,
                'title' => $notif->title ?? ucfirst(str_replace('_', ' ', $notif->event_type)),
                'body' => $notif->body,
                'sent_at' => $notif->created_at ? $notif->created_at->diffForHumans() : 'Just now',
                'read' => (bool) $notif->is_read,
                'concern_id' => $payload['concern_id'] ?? null,
                'blotter_id' => $payload['blotter_id'] ?? null,
            ];
        });

        // 3. Mark all unread notifications as read
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        // 4. Send the data to the React page
        return Inertia::render('Resident/Notifications', [
            'notifications' => $notifications->values(),
        ]);
    }
}