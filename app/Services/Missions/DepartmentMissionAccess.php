<?php

namespace App\Services\Missions;

use App\Enums\PersonnelRole;
use App\Enums\PersonnelDepartment;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\Notification;
use App\Models\Personnel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class DepartmentMissionAccess
{
    private function isVawDesk(Personnel $personnel): bool
    {
        $isPeaceAndOrder = $this->normalizeDepartment($personnel->department) === PersonnelDepartment::PeaceOrder->label();
        $isVawDeskRole = $personnel->role === PersonnelRole::VawDesk
            || in_array($personnel->role, ['vaw_desk', 'VAW Desk', 'VAW Desk · Confidential cases']);

        return $isPeaceAndOrder && $isVawDeskRole;
    }

    public function departmentAliases(mixed $department): array
    {
        $raw = $department instanceof PersonnelDepartment ? $department->value : (string) $department;
        $aliases = [$raw];
        $normalized = $this->normalizeDepartment($department);
        if ($normalized !== null) {
            $aliases[] = $normalized;
        }

        return array_values(array_unique($aliases));
    }

    public function departmentQueue(Personnel $personnel): Builder
    {
        return Mission::query()
            ->where('barangay_id', $this->barangayId($personnel))
            ->whereNotNull('department')
            ->whereIn('department', $this->departmentAliases($personnel->department))
            ->when(
                ! $this->isVawDesk($personnel),
                fn (Builder $query) => $query->whereHas('concern', fn (Builder $concern) => $concern->whereNotVawc())
            )
            ->whereHas('concern')
            ->with(['concern.subcategory', 'concern.media', 'proof', 'personnel']);
    }

    public function canView(Personnel $personnel, Mission $mission): bool
    {
        if ($mission->barangay_id !== $this->barangayId($personnel)) {
            return false;
        }

        if (
            empty($personnel->department)
            || $this->normalizeDepartment($mission->department) !== $this->normalizeDepartment($personnel->department)
        ) {
            return false;
        }

        if (! $mission->relationLoaded('concern')) {
            $mission->load('concern.subcategory');
        } elseif ($mission->concern && ! $mission->concern->relationLoaded('subcategory')) {
            $mission->concern->load('subcategory');
        }

        if ($mission->concern && ! $this->canViewSensitiveConcern($personnel, $mission->concern)) {
            return false;
        }

        return true;
    }

    public function canViewSensitiveConcern(Personnel $personnel, Concern $concern): bool
    {
        if (! $concern->isSensitiveConcern()) {
            return true;
        }

        return $this->isVawDesk($personnel);
    }

    public function assertCanView(Personnel $personnel, Mission $mission): void
    {
        abort_unless($this->canView($personnel, $mission), 404);
    }

    private function barangayId(Personnel $personnel): ?string
    {
        return $personnel->user?->barangay_id ?? $personnel->user()->value('barangay_id');
    }

    private function normalizeDepartment(mixed $department): ?string
    {
        if ($department instanceof PersonnelDepartment) {
            return $department->label();
        }

        if (! is_string($department) || trim($department) === '') {
            return null;
        }

        $department = trim($department);
        foreach (PersonnelDepartment::cases() as $candidate) {
            if ($department === $candidate->value || strcasecmp($department, $candidate->label()) === 0) {
                return $candidate->label();
            }
        }

        return $department;
    }

    /**
     * @param Collection<int, Notification> $notifications
     * @return Collection<int, Notification>
     */
    public function visibleNotifications(Personnel $personnel, Collection $notifications): Collection
    {
        $missionIds = $notifications
            ->map(fn (Notification $notification) => (is_array($notification->payload) ? $notification->payload : [])['mission_id'] ?? null)
            ->filter()
            ->unique()
            ->values();

        $concernIds = $notifications
            ->map(fn (Notification $notification) => (is_array($notification->payload) ? $notification->payload : [])['concern_id'] ?? null)
            ->filter()
            ->unique()
            ->values();

        if ($missionIds->isEmpty() && $concernIds->isEmpty()) {
            return $notifications;
        }

        $missions = Mission::query()
            ->with('concern.subcategory')
            ->whereIn('id', $missionIds)
            ->get()
            ->keyBy('id');

        $concerns = Concern::query()
            ->with('subcategory')
            ->whereIn('id', $concernIds)
            ->get()
            ->keyBy('id');

        return $notifications->filter(function (Notification $notification) use ($missions, $concerns, $personnel) {
            $payload = is_array($notification->payload) ? $notification->payload : [];
            $missionId = $payload['mission_id'] ?? null;
            if ($missionId) {
                $mission = $missions->get($missionId);
                if (! $mission || ! $this->canView($personnel, $mission)) {
                    return false;
                }
            }

            $concernId = $payload['concern_id'] ?? null;
            if ($concernId) {
                $concern = $concerns->get($concernId);
                if (! $concern || ! $this->canViewSensitiveConcern($personnel, $concern)) {
                    return false;
                }
            }

            return true;
        });
    }
}   