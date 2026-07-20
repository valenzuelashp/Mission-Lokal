<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    public static function log(string $action, string $entityType, string $entityId, array $metadata = []): void
    {
        DB::table('audit_logs')->insert([
            'barangay_id' => Auth::user()->barangay_id,
            'actor_id'    => Auth::id(),
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'metadata'    => json_encode($metadata),
            'ip_address'  => request()->ip(),
            'created_at'  => now(),
        ]);
    }
}