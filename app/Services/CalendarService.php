<?php

namespace App\Services;

use App\Enums\AnnouncementKind;
use App\Enums\UserRole;
use App\Models\Announcement;
use App\Models\Mission;
use App\Models\Personnel;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class CalendarService
{
    /**
     * @return array{
     *     year: int,
     *     month: int,
     *     month_label: string,
     *     today: string,
     *     prev: array{year: int, month: int},
     *     next: array{year: int, month: int},
     *     events: list<array<string, mixed>>
     * }
     */
    public function monthFor(User $user, ?int $year = null, ?int $month = null): array
    {
        $now = CarbonImmutable::now('Asia/Manila');
        $year = max(2020, min(2100, $year ?: $now->year));
        $month = max(1, min(12, $month ?: $now->month));

        $cursor = CarbonImmutable::create($year, $month, 1, 0, 0, 0, 'Asia/Manila')->startOfMonth();
        $start = $cursor->startOfMonth();
        $end = $cursor->endOfMonth();
        $queryStart = $start->subDay()->timezone('UTC');
        $queryEnd = $end->addDay()->timezone('UTC');
        $role = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;

        $events = match ($role) {
            UserRole::Admin->value, UserRole::SuperAdmin->value => $this->adminEvents($user, $queryStart, $queryEnd),
            UserRole::Personnel->value => $this->personnelEvents($user, $queryStart, $queryEnd),
            default => $this->residentEvents($user, $queryStart, $queryEnd),
        };

        $monthPrefix = $cursor->format('Y-m-');
        $sorted = $events
            ->filter(fn (array $event) => str_starts_with((string) $event['date'], $monthPrefix))
            ->sortBy(fn (array $event) => $event['date'].' '.($event['time'] ?? '').' '.$event['title'])
            ->values();

        $previous = $cursor->subMonth();
        $following = $cursor->addMonth();

        return [
            'year' => $cursor->year,
            'month' => $cursor->month,
            'month_label' => $cursor->format('F Y'),
            'today' => $now->toDateString(),
            'prev' => [
                'year' => $previous->year,
                'month' => $previous->month,
            ],
            'next' => [
                'year' => $following->year,
                'month' => $following->month,
            ],
            'events' => $sorted->all(),
        ];
    }

    private function residentEvents(User $user, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return $this->announcementEvents($user->barangay_id, $start, $end, true, 'resident', $user->id);
    }

    private function adminEvents(User $user, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        return $this->announcementEvents($user->barangay_id, $start, $end, false, 'admin')
            ->concat($this->missionEvents($user->barangay_id, $start, $end, null, 'admin'));
    }

    private function personnelEvents(User $user, CarbonImmutable $start, CarbonImmutable $end): Collection
    {
        $personnel = Personnel::query()->where('user_id', $user->id)->first();

        $announcements = $this->announcementEvents($user->barangay_id, $start, $end, true, 'personnel');

        if (! $personnel) {
            return $announcements;
        }

        return $announcements->concat(
            $this->missionEvents($user->barangay_id, $start, $end, $personnel->id, 'personnel')
        );
    }

    private function announcementEvents(
        ?string $barangayId,
        CarbonImmutable $start,
        CarbonImmutable $end,
        bool $publishedOnly,
        string $audience,
        ?string $viewerId = null,
    ): Collection {
        $items = Announcement::query()
            ->where('barangay_id', $barangayId)
            ->when($publishedOnly, fn ($query) => $query->where('is_published', true))
            ->when($viewerId, function ($query) use ($viewerId) {
                $query->withExists([
                    'volunteers as joined' => fn ($inner) => $inner->where('user_id', $viewerId),
                ]);
            })
            ->where(function ($query) use ($start, $end) {
                $query->whereBetween('published_at', [$start, $end])
                    ->orWhere(function ($inner) use ($start, $end) {
                        $inner->whereNull('published_at')->whereBetween('created_at', [$start, $end]);
                    });
            })
            ->get();

        return $items->map(function (Announcement $item) use ($audience) {
            $at = $item->published_at ?? $item->created_at;
            $kind = $item->resolvedKind();
            $going = $kind === AnnouncementKind::Volunteer && (bool) $item->joined;

            return $this->event(
                id: 'announcement-'.$item->id,
                date: $at,
                title: $item->title,
                type: 'announcement',
                href: match ($audience) {
                    'admin' => '/admin/announcements/'.$item->id.'/edit',
                    default => '/announcements/'.$item->id,
                },
                subtitle: $going ? 'You are going' : $kind->calendarSubtitle((bool) $item->is_published),
                going: $going,
            );
        });
    }

    private function missionEvents(
        ?string $barangayId,
        CarbonImmutable $start,
        CarbonImmutable $end,
        ?string $personnelId,
        string $audience
    ): Collection {
        $items = Mission::query()
            ->with('concern')
            ->where('barangay_id', $barangayId)
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$start->toDateString(), $end->toDateString()])
            ->when($personnelId, function ($query) use ($personnelId) {
                $query->whereHas('personnel', fn ($personnel) => $personnel->where('personnel.id', $personnelId));
            })
            ->get();

        return $items->map(function (Mission $item) use ($audience) {
            $title = $item->concern?->title ?? 'Mission due';

            return $this->event(
                id: 'mission-'.$item->id,
                date: $item->due_date,
                title: $title,
                type: 'mission',
                href: match ($audience) {
                    'personnel' => '/personnel/missions/'.$item->id,
                    default => '/admin/missions/'.$item->id,
                },
                subtitle: 'Mission due',
                dateOnly: true,
            );
        });
    }

    /**
     * @return array{id: string, date: string, time: string|null, title: string, subtitle: string|null, type: string, href: string, going: bool}
     */
    private function event(
        string $id,
        mixed $date,
        string $title,
        string $type,
        string $href,
        ?string $subtitle = null,
        bool $dateOnly = false,
        bool $going = false,
    ): array {
        if ($dateOnly) {
            $parsed = CarbonImmutable::parse($date, 'Asia/Manila')->startOfDay();
            $time = null;
        } else {
            $parsed = CarbonImmutable::parse($date, config('app.timezone') ?: 'UTC')->timezone('Asia/Manila');
            $time = $parsed->format('H:i') === '00:00' ? null : $parsed->format('g:i A');
        }

        return [
            'id' => $id,
            'date' => $parsed->toDateString(),
            'time' => $time,
            'title' => $title,
            'subtitle' => $subtitle,
            'type' => $type,
            'href' => $href,
            'going' => $going,
        ];
    }
}
