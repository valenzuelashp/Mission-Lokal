<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\Personnel;
use App\Models\User;
use App\Services\Missions\DepartmentMissionAccess;

class SensitiveMediaAccess
{
    private function isVawDesk(Personnel $personnel): bool
    {
        $isPeaceAndOrder = in_array($personnel->department, ['Peace & Order', 'peace_order']);
        $isVawDeskRole = in_array($personnel->role, ['vaw_desk', 'VAW Desk', 'VAW Desk · Confidential cases']);

        return $isPeaceAndOrder && $isVawDeskRole;
    }

    public function canViewConcern(User $user, Concern $concern): bool
    {
        $role = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
        if ($role === UserRole::SuperAdmin->value) {
            return true;
        }

        if ($user->barangay_id !== $concern->barangay_id) {
            return false;
        }

        if ($role === UserRole::Resident->value) {
            return $concern->reporter_id === $user->id
                || (
                    $concern->visibility === 'public'
                    && ! $concern->isSensitiveConcern()
                );
        }

        if ($role === UserRole::Admin->value) {
            return true;
        }

        if ($role !== UserRole::Personnel->value) {
            return false;
        }

        $personnel = Personnel::query()->where('user_id', $user->id)->first();
        if (! $personnel || empty($personnel->department)) {
            return false;
        }

        if ($concern->isSensitiveConcern()) {
            return $this->isVawDesk($personnel);
        }

        $mission = Mission::query()
            ->where('concern_id', $concern->id)
            ->first();

        return $mission !== null
            && app(DepartmentMissionAccess::class)->canView($personnel, $mission);
    }
}