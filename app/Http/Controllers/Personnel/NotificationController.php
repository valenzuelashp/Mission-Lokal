<?php

namespace App\Http\Controllers\Personnel;

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

        // 1. Fetch real database notifications for the logged-in personnel user
        $notificationsDb = Notification::where('user_id', $user->id)
            ->latest('created_at')
            ->get();

        $notifications = $notificationsDb->map(function ($notif) {
            // Extract mission_id from payload if present
            $payload = is_array($notif->payload) ? $notif->payload : json_decode($notif->payload ?? '{}', true);
            
            return [
                'id' => $notif->id,
                'title' => $notif->title ?? ucfirst(str_replace('_', ' ', $notif->event_type)),
                'body' => $notif->body,
                'sent_at' => $notif->created_at ? $notif->created_at->diffForHumans() : 'Just now',
                'read' => (bool) $notif->is_read,
                'mission_id' => $payload['mission_id'] ?? null,
            ];
        });

        // 2. Automatically mark unread notifications as read when visiting the page (optional convenience)
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $unread = $notifications->where('read', false)->count();

        return Inertia::render('Personnel/Notifications', [
            'notifications' => $notifications->values(),
            'unread_count' => $unread,
        ]);
    }
}