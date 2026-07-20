<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display a multi-tenant scoped log roster of system events.
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        // Fetch logs for this barangay joined with the user who triggered it
        $logs = DB::table('audit_logs')
            ->leftJoin('users', 'audit_logs.actor_id', '=', 'users.id')
            ->where('audit_logs.barangay_id', $barangayId)
            ->select([
                'audit_logs.id',
                'audit_logs.action',
                'audit_logs.entity_type',
                'audit_logs.metadata',
                'audit_logs.created_at',
                'users.first_name',
                'users.last_name',
                'users.email'
            ])
            ->latest('audit_logs.created_at')
            ->paginate(15)
            ->through(function ($log) {
                // Safely format username strings
                $actor = $log->first_name 
                    ? trim($log->first_name . ' ' . $log->last_name) 
                    : 'System / Automated';

                // Safely decode any custom details payload string
                $meta = json_decode($log->metadata ?? '{}', true);

                return [
                    'id' => (string) $log->id,
                    'action' => $log->action, 
                    'entity' => $log->entity_type, 
                    'actor' => $actor,
                    'actor_email' => $log->email ?? 'N/A',
                    'details' => $meta['details'] ?? 'No extra tracking metadata attached.',
                    'timestamp' => $log->created_at ? date('M d, Y h:i A', strtotime($log->created_at)) : 'Just now',
                ];
            });

        return Inertia::render('Admin/AuditLog', [
            'logs' => $logs,
        ]);
    }
}