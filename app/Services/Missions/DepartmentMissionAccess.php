<?php

namespace App\Services\Missions;

use App\Enums\ConcernCategoryCode;
use App\Enums\PersonnelDepartment;
use App\Enums\PersonnelRole;
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
        $isVawDeskRole = in_array($personnel->role, [PersonnelRole::VawDesk, PersonnelRole::Lupon], true)
            || in_array($personnel->role, ['vaw_desk', 'lupon', 'Lupon', 'VAW Desk', 'VAW Desk · Confidential cases']);

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
        $role = $this->roleValue($personnel);
        $codes = array_map(fn ($category) => $category->value, array_filter(ConcernCategoryCode::cases(), fn ($category) => in_array($role, $category->roles(), true)));

        return Mission::query()
            ->where('barangay_id', $this->barangayId($personnel))
            ->whereNotNull('department')
            ->whereIn('department', $this->departmentAliases($personnel->department))
            ->when(
                ! $this->isVawDesk($personnel),
                fn (Builder $query) => $query->whereHas('concern', fn (Builder $concern) => $concern->whereNotVawc())
            )
            ->whereHas('concern')
            ->whereHas('concern.category', fn (Builder $category) => $category->whereIn('code', $codes))
            ->with(['concern.subcategory', 'concern.currentAiAnalysis.suggestedSubcategory', 'concern.media', 'proof', 'personnel']);
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
        } elseif ($mission->concern) {
            $mission->concern->loadMissing('subcategory');
        }

        if ($mission->concern?->exists) {
            $mission->concern->loadMissing('currentAiAnalysis.suggestedSubcategory');
        }

        if ($mission->concern && ! $this->canViewSensitiveConcern($personnel, $mission->concern)) {
            return false;
        }

        return true;
    }

    public function canViewSensitiveConcern(Personnel $personnel, Concern $concern): bool
    {
        $definition = $concern->categoryDefinition();
        if ($definition && ! in_array($this->roleValue($personnel), $definition->roles(), true)) {
            return false;
        }
        if (! $concern->isVawcConcern()) {
            return true;
        }

        return $this->isVawDesk($personnel);
    }

    private function roleValue(Personnel $personnel): string
    {
        if ($personnel->role instanceof PersonnelRole) {
            return $personnel->role->value;
        }
        $raw = strtolower(trim((string) $personnel->role));
        foreach (PersonnelRole::cases() as $role) {
            if ($raw === $role->value || $raw === strtolower($role->label())) {
                return $role->value;
            }
        }

        return str_starts_with($raw, 'vaw desk') ? 'vaw_desk' : $raw;
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
     * @param  Collection<int, Notification>  $notifications
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
            ->with(['concern.subcategory', 'concern.currentAiAnalysis.suggestedSubcategory'])
            ->whereIn('id', $missionIds)
            ->get()
            ->keyBy('id');

        $concerns = Concern::query()
            ->with(['subcategory', 'currentAiAnalysis.suggestedSubcategory'])
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
