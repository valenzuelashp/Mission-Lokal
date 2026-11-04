<?php

namespace App\Services\Missions;

use App\Enums\PersonnelRole;
use App\Enums\PersonnelDepartment;
use App\Models\Concern;
use App\Models\Personnel;
use Illuminate\Validation\ValidationException;

class MissionDepartmentAssignment
{
    /**
     * @param list<string> $personnelIds
     */
    public function departmentFor(Concern $concern, array $personnelIds): string
    {
        $personnel = Personnel::query()
            ->whereIn('id', $personnelIds)
            ->get(['id', 'role', 'department']);

        if ($personnel->count() !== count(array_unique($personnelIds))) {
            throw ValidationException::withMessages([
                'personnel_ids' => 'Select personnel with a valid department and role.',
            ]);
        }

        $departments = $personnel->map(function (Personnel $member) {
            $department = $this->normalizeDepartment($member->department);
            $role = $member->role instanceof PersonnelRole
                ? $member->role->label()
                : trim((string) $member->role);
            $roleEnum = $member->role instanceof PersonnelRole
                ? $member->role
                : $this->roleEnum($role);
            $departmentEnum = $this->departmentEnum($department);

            if ($department === null || $role === '') {
                return null;
            }

            if ($roleEnum && $roleEnum->department() !== $departmentEnum) {
                return null;
            }

            return $department;
        });

        if ($departments->contains(null) || $departments->unique()->count() !== 1) {
            throw ValidationException::withMessages([
                'personnel_ids' => 'All selected personnel must belong to the same department and have a matching role.',
            ]);
        }

        $department = $departments->first();
        if ($concern->isVawcConcern()) {
            $onlyVawDesk = $this->departmentEnum($department) === PersonnelDepartment::PeaceOrder
                && $personnel->every(fn (Personnel $member) => $this->isVawDeskRole($member->role));

            if (! $onlyVawDesk) {
                throw ValidationException::withMessages([
                    'personnel_ids' => 'VAWC-classified concerns can only be assigned to Peace & Order VAW Desk personnel.',
                ]);
            }
        }

        return $department;
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

        return $this->departmentEnum($department)?->label() ?? $department;
    }

    private function departmentEnum(?string $department): ?PersonnelDepartment
    {
        if ($department === null) {
            return null;
        }

        foreach (PersonnelDepartment::cases() as $candidate) {
            if ($department === $candidate->value || strcasecmp($department, $candidate->label()) === 0) {
                return $candidate;
            }
        }

        return null;
    }

    private function roleEnum(string $role): ?PersonnelRole
    {
        foreach (PersonnelRole::cases() as $candidate) {
            if ($role === $candidate->value || strcasecmp($role, $candidate->label()) === 0) {
                return $candidate;
            }
        }

        return null;
    }

    private function isVawDeskRole(mixed $role): bool
    {
        if ($role instanceof PersonnelRole) {
            return $role === PersonnelRole::VawDesk;
        }

        return is_string($role)
            && in_array($role, ['vaw_desk', 'VAW Desk', 'VAW Desk · Confidential cases'], true);
    }
}
