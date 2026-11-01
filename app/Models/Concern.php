<?php

namespace App\Models;

use App\Enums\ConcernStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Concern extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'concerns';

    protected $fillable = [
        'barangay_id',
        'reporter_id',
        'title',
        'description',
        'category_id',
        'subcategory_id',
        'visibility',
        'severity',
        'severity_confirmed',
        'status',
        'location',
        'public_location',
        'address_text',
        'is_blotter_candidate',
        'duplicate_of_id',
        'ai_processed_at',
        'staff_reviewed_by',
        'staff_reviewed_at',
        'closed_summary',
    ];

    protected function casts(): array
    {
        return [
            'severity_confirmed' => 'boolean',
            'is_blotter_candidate' => 'boolean',
            'status' => ConcernStatus::class,
            'ai_processed_at' => 'datetime',
            'staff_reviewed_at' => 'datetime',
        ];
    }

    public function locationLabel(): string
    {
        $address = trim((string) $this->address_text);

        if ($address === '' || preg_match('/^Coordinates\s*:/i', $address) === 1) {
            return 'Pinned location';
        }

        return $address;
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ConcernCategory::class, 'category_id');
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(ConcernSubcategory::class, 'subcategory_id');
    }

    public function isVawcConcern(): bool
    {
        if ($this->subcategory?->code === 'VAWC') {
            return true;
        }

        return self::isVawcReport(null, $this->title ?? '', $this->description ?? '');
    }

    public function isSensitiveConcern(): bool
    {
        return (bool) $this->is_blotter_candidate || $this->isVawcConcern();
    }

    public static function isVawcReport(?string $categoryKey, string $title = '', string $description = ''): bool
    {
        return $categoryKey === 'vawc' || preg_match(
            '/\b(vawc|violence\s+against\s+women|domestic\s+(?:violence|dispute)|ra\s*9262)\b/i',
            $title.' '.$description
        ) === 1;
    }

    public function scopeWhereNotVawc(Builder $query): Builder
    {
        $query->where(function (Builder $privacy) {
            $privacy->whereNull('is_blotter_candidate')
                ->orWhere('is_blotter_candidate', false);
        });
        $query->whereDoesntHave('subcategory', fn (Builder $subcategory) => $subcategory->where('code', 'VAWC'));

        foreach (['%vawc%', '%violence against women%', '%domestic%', '%ra%9262%'] as $pattern) {
            $query->where(function (Builder $text) use ($pattern) {
                $text->whereRaw('LOWER(title) NOT LIKE ?', [$pattern])
                    ->whereRaw('LOWER(description) NOT LIKE ?', [$pattern]);
            });
        }

        return $query;
    }

    public function suggestedPersonnelDepartment(): string
    {
        $subcategoryCode = strtoupper((string) $this->subcategory?->code);
        $categoryCode = strtoupper((string) $this->category?->code);
        $text = strtolower(($this->title ?? '').' '.($this->description ?? ''));

        if ($this->isSensitiveConcern() || $categoryCode === 'SEC') {
            return 'Peace & Order';
        }

        if (preg_match('/\b(dog|dogs|cat|cats|stray\s+animal|animal\s+rescue)\b/i', $text) === 1) {
            return 'Animal Response Team';
        }

        if (
            str_contains($subcategoryCode, 'TRAFFIC')
            || str_contains($subcategoryCode, 'OBSTRUCTION')
            || preg_match('/\b(traffic|road\s+obstruction|blocked\s+road|clearing)\b/i', $text) === 1
        ) {
            return 'Traffic Management';
        }

        if ($categoryCode === 'SANI') {
            return 'Environmental';
        }

        if (
            str_contains($subcategoryCode, 'DRAINAGE')
            || str_contains($subcategoryCode, 'STREET_LIGHT')
            || preg_match('/\b(electric|electrical|drainage|street\s+light|minor\s+repair|clogged\s+drain)\b/i', $text) === 1
        ) {
            return 'Maintenance';
        }

        return 'Utility & Infrastructure';
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(Concern::class, 'duplicate_of_id');
    }

    public function duplicates(): HasMany
    {
        return $this->hasMany(Concern::class, 'duplicate_of_id');
    }

    public function primaryDuplicateLinks(): HasMany
    {
        return $this->hasMany(ConcernDuplicateLink::class, 'primary_concern_id');
    }

    public function secondaryDuplicateLinks(): HasMany
    {
        return $this->hasMany(ConcernDuplicateLink::class, 'linked_concern_id');
    }

    public function staffReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_reviewed_by');
    }

    public function media(): HasMany
    {
        return $this->hasMany(ConcernMedia::class);
    }

    public function currentAiAnalysis(): HasOne
    {
        return $this->hasOne(ConcernAiAnalysis::class)->where('is_current', true);
    }

    public function aiAnalyses(): HasMany
    {
        return $this->hasMany(ConcernAiAnalysis::class);
    }

    public function mission(): HasOne
    {
        return $this->hasOne(Mission::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(ConcernVote::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ConcernStatusHistory::class);
    }

    public function latestStatusHistory(): HasOne
    {
        return $this->hasOne(ConcernStatusHistory::class)->latestOfMany('created_at');
    }

    public function denyUnlessVisibleToResident(User $user): void
    {
        if ($this->barangay_id !== $user->barangay_id) {
            abort(403, 'Unauthorized access request outside geographic boundary.');
        }

        if (
            ($this->visibility === 'private' || $this->isSensitiveConcern())
            && $this->reporter_id !== $user->id
        ) {
            abort(403, 'This concern is private and restricted to the original reporter.');
        }
    }

    public static function shouldForcePrivate(?string $categoryKey, string $title = '', string $description = ''): bool
    {
        return self::isVawcReport($categoryKey, $title, $description);
    }
}