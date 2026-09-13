<?php

namespace App\Models;

use App\Enums\AnnouncementKind;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Announcement extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'barangay_id',
        'title',
        'body',
        'summary',
        'kind',
        'cover_image_url',
        'is_published',
        'published_at',
        'event_at',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'kind' => AnnouncementKind::class,
        ];
    }

    /**
     * Event/volunteer times are barangay local (Asia/Manila) wall-clock values.
     */
    protected function eventAt(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value === null || $value === '') {
                    return null;
                }

                return Carbon::parse($value, 'Asia/Manila');
            },
            set: function ($value) {
                if ($value === null || $value === '') {
                    return ['event_at' => null];
                }

                $parsed = $value instanceof DateTimeInterface
                    ? Carbon::parse($value)->timezone('Asia/Manila')
                    : Carbon::parse($value, 'Asia/Manila');

                return ['event_at' => $parsed->format('Y-m-d H:i:s.v')];
            },
        );
    }

    // --- Relationships ---

    /**
     * Get the Barangay that owns the announcement.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Get the User who created the announcement.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function volunteers(): HasMany
    {
        return $this->hasMany(AnnouncementVolunteer::class);
    }

    public function resolvedKind(): AnnouncementKind
    {
        return $this->kind instanceof AnnouncementKind
            ? $this->kind
            : AnnouncementKind::tryFrom((string) $this->kind) ?? AnnouncementKind::Advisory;
    }

    public function isScheduledKind(): bool
    {
        $kind = $this->resolvedKind();

        return $kind === AnnouncementKind::Event || $kind === AnnouncementKind::Volunteer;
    }

    public function calendarAt(): ?CarbonInterface
    {
        if ($this->isScheduledKind() && $this->event_at) {
            return $this->event_at;
        }

        return $this->published_at ?? $this->created_at;
    }

    public function eventAtInputValue(): ?string
    {
        if (! $this->event_at) {
            return null;
        }

        return $this->event_at->format('Y-m-d\TH:i');
    }

    public function eventAtLabel(?string $format = 'M d, Y g:i A'): ?string
    {
        if (! $this->event_at) {
            return null;
        }

        return $this->event_at->format($format);
    }

    public function imageUrl(): ?string
    {
        $key = $this->cover_image_url;

        if (! $key) {
            return null;
        }

        if (str_starts_with($key, 'http://') || str_starts_with($key, 'https://')) {
            return $key;
        }

        return Storage::url($key);
    }

    /**
     * @return array<string, mixed>
     */
    public function toResidentArray(?string $viewerId = null, bool $fullBody = false): array
    {
        $kind = $this->resolvedKind();
        $isVolunteer = $kind === AnnouncementKind::Volunteer;
        $body = $fullBody
            ? $this->body
            : ($this->summary ?? $this->body);

        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'body' => $body,
            'kind' => $kind->value,
            'kind_label' => $kind->label(),
            'image_url' => $this->imageUrl(),
            'published_at' => $this->published_at
                ? $this->published_at->timezone('Asia/Manila')->format($fullBody ? 'F d, Y g:i A' : 'M d, Y')
                : $this->created_at?->timezone('Asia/Manila')->format($fullBody ? 'F d, Y' : 'M d, Y'),
            'event_at' => $this->eventAtLabel($fullBody ? 'F d, Y g:i A' : 'M d, Y g:i A'),
            'author_name' => $this->creator
                ? trim($this->creator->first_name.' '.$this->creator->last_name)
                : 'Barangay Desk',
            'volunteer_count' => $isVolunteer ? (int) ($this->volunteers_count ?? $this->volunteers()->count()) : 0,
            'has_joined' => $isVolunteer && $viewerId
                ? (bool) ($this->joined ?? $this->volunteers()->where('user_id', $viewerId)->exists())
                : false,
        ];
    }
}