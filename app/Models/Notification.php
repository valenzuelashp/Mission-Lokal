<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'channel',
        'event_type',
        'title',
        'body',
        'payload',
        'is_read',
        'sent_at',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'payload' => 'array',
            'sent_at' => 'datetime',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function notifyBarangayAdmins(?string $barangayId, string $eventType, string $title, string $body, array $payload = []): void
    {
        $admins = User::query()
            ->whereIn('role', [UserRole::Admin, UserRole::SuperAdmin])
            ->when($barangayId, function ($query) use ($barangayId) {
                $query->where(function ($inner) use ($barangayId) {
                    $inner->where('barangay_id', $barangayId)
                        ->orWhereNull('barangay_id')
                        ->orWhere('role', UserRole::SuperAdmin);
                });
            })
            ->get();

        foreach ($admins as $admin) {
            static::create([
                'user_id' => $admin->id,
                'channel' => 'in_app',
                'event_type' => $eventType,
                'title' => $title,
                'body' => $body,
                'payload' => $payload,
                'is_read' => false,
                'sent_at' => now(),
            ]);
        }
    }
}