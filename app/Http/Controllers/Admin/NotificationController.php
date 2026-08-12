<?php

namespace App\Http\Controllers\Admin;

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

        // 1. Fetch real database notifications for the logged-in admin user
        $notificationsDb = Notification::where('user_id', $user->id)
            ->latest('created_at')
            ->get();

        // 2. Format the data for React, extracting specific payload IDs
        $notifications = $notificationsDb->map(function ($notif) {
            $payload = is_array($notif->payload) ? $notif->payload : json_decode($notif->payload ?? '{}', true);
            
            return [
                'id' => $notif->id,
                'title' => $notif->title ?? ucfirst(str_replace('_', ' ', $notif->event_type)),
                'body' => $notif->body,
                'sent_at' => $notif->created_at ? $notif->created_at->diffForHumans() : 'Just now',
                'read' => (bool) $notif->is_read,
                'concern_id' => $payload['concern_id'] ?? null,
                'mission_id' => $payload['mission_id'] ?? null,
            ];
        });

        // 3. Mark unread notifications as read automatically
        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return Inertia::render('Admin/Notifications', [
            'notifications' => $notifications->values(),
        ]);
    }
}