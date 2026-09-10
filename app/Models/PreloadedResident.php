<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreloadedResident extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'first_name',
        'middle_name',
        'last_name',
        'name_extension',
        'sex',
        'civil_status',
        'birthday',
        'house_street',
        'barangay_name',
        'city',
        'province',
        'email',
        'mobile',
        'is_claimed',
        'claimed_at',
        'user_id',
    ];

    public static function findByIdentity(string $firstName, string $lastName, mixed $birthday, ?string $middleName = null): ?self
    {
        $first = mb_strtolower(trim($firstName));
        $last = mb_strtolower(trim($lastName));
        $middle = $middleName !== null ? mb_strtolower(trim($middleName)) : '';

        $byName = static::query()
            ->whereRaw('LOWER(TRIM(first_name)) = ?', [$first])
            ->whereRaw('LOWER(TRIM(last_name)) = ?', [$last]);

        $entered = \Carbon\Carbon::parse($birthday);
        $enteredDate = $entered->toDateString();

        $exact = (clone $byName)->whereDate('birthday', $enteredDate)->first();
        if ($exact) {
            return $exact;
        }

        $day = (int) $entered->format('d');
        $month = (int) $entered->format('m');
        $year = (int) $entered->format('Y');
        if ($day !== $month && $day <= 12 && checkdate($day, $month, $year)) {
            $swapped = sprintf('%04d-%02d-%02d', $year, $day, $month);
            $swappedMatch = (clone $byName)->whereDate('birthday', $swapped)->first();
            if ($swappedMatch) {
                return $swappedMatch;
            }
        }

        $candidates = (clone $byName)->get();
        if ($candidates->isEmpty()) {
            return null;
        }

        if ($middle !== '') {
            $withMiddle = $candidates->first(function (self $row) use ($middle) {
                return mb_strtolower(trim((string) $row->middle_name)) === $middle;
            });
            if ($withMiddle) {
                return $withMiddle;
            }
        }

        if ($candidates->count() === 1) {
            return $candidates->first();
        }

        return $candidates->sortBy(function (self $row) use ($entered) {
            return abs($entered->diffInDays(\Carbon\Carbon::parse($row->birthday), false));
        })->first();
    }
}