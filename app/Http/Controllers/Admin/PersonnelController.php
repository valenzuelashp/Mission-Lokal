<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\PersonnelRole;
use App\Models\Department;
use App\Models\Personnel;
use App\Models\User;
use App\Services\LocalIdentifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PersonnelController extends Controller
{
    private function getDepartmentRoleOptions(string $barangayId): array
    {
        $roleOptions = [];
        $roleLabels = [];

        foreach (PersonnelRole::cases() as $role) {
            $roleLabels[$role->value] = $role->label();
        }

        Personnel::query()
            ->whereHas('user', fn ($query) => $query
                ->where('barangay_id', $barangayId)
                ->where('role', 'personnel'))
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->whereNotNull('role')
            ->where('role', '!=', '')
            ->get(['department', 'role'])
            ->each(function (Personnel $personnel) use (&$roleOptions, $roleLabels) {
                $department = $personnel->department;
                $role = $personnel->role;

                if (! is_string($department) || ! is_string($role)) {
                    return;
                }

                $roleOptions[$department][$role] = [
                    'value' => $role,
                    'label' => $roleLabels[$role] ?? ucwords(str_replace('_', ' ', $role)),
                ];
            });

        foreach ($roleOptions as &$roles) {
            uasort($roles, fn (array $left, array $right) => strcasecmp($left['label'], $right['label']));
            $roles = array_values($roles);
        }
        unset($roles);

        return $roleOptions;
    }

    private function getAvailableDepartments(string $barangayId): array
    {
        $legacyMapping = [
            'traffic_management' => 'Traffic Management',
            'environmental' => 'Environmental',
            'peace_order' => 'Peace & Order',
            'utility_infrastructure' => 'Utility & Infrastructure',
            'tambo_animal_response' => 'Animal Response Team',
            'maintenance' => 'Maintenance',
        ];

        foreach ($legacyMapping as $old =>$new) {
            Personnel::whereHas('user', function ($q) use ($barangayId) {
                $q->where('barangay_id',$barangayId);
            })->where('department', $old)->update(['department' =>$new]);
        }

        $defaultDepartments = [
            'Traffic Management',
            'Environmental',
            'Peace & Order',
            'Utility & Infrastructure',
            'Animal Response Team',
            'Maintenance'
        ];

        $existingDepartments = Personnel::whereHas('user', function ($q) use ($barangayId) {
                $q->where('barangay_id',$barangayId);
            })
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->pluck('department')
            ->toArray();

        $registeredDepartments = Department::query()
            ->where('barangay_id', $barangayId)
            ->orderBy('name')
            ->pluck('name')
            ->toArray();

        $allDepartments = array_unique(array_merge($defaultDepartments, $registeredDepartments, $existingDepartments));
        sort($allDepartments);
        
        return $allDepartments;
    }

    public function departments(Request $request): Response
    {
        $barangayId =$request->user()->barangay_id;
        $allDepartments = $this->getAvailableDepartments($barangayId);

        $departmentsData = [];
        foreach ($allDepartments as $deptName) {$count = Personnel::whereHas('user', function($q) use ($barangayId) {
                $q->where('barangay_id',$barangayId)->where('is_active', true);
            })->where('department', $deptName)->count();

            $departmentsData[] = [
                'name' => $deptName,
                'personnel_count' => $count
            ];
        }

        $totalPersonnel = Personnel::whereHas('user', function($q) use ($barangayId) {
            $q->where('barangay_id',$barangayId)->where('is_active', true);
        })->count();

        $barangay =$request->user()->barangay;
        $nextAccountId = LocalIdentifier::next($barangay, LocalIdentifier::PER);

        return Inertia::render('Admin/Personnel/Departments', [
            'departments' => $departmentsData,
            'department_roles' => $this->getDepartmentRoleOptions($barangayId),
            'total_personnel' => $totalPersonnel,
            'next_account_id' => $nextAccountId,
        ]);
    }

    public function storeDepartment(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $name = preg_replace('/\s+/', ' ', trim((string) $request->input('name')));
        $request->merge(['name' => $name]);

        $existing = collect($this->getAvailableDepartments($barangayId))
            ->contains(fn (string $department) => strcasecmp($department, $name) === 0);
        if ($existing) {
            return back()->withErrors(['name' => 'This department already exists.'])->withInput();
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('departments', 'name')
                    ->where(fn ($query) => $query->where('barangay_id', $barangayId)),
            ],
        ]);

        DB::transaction(function () use ($validated, $barangayId, $request) {
            $department = Department::create([
                'barangay_id' => $barangayId,
                'name' => $validated['name'],
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'CREATE',
                'entity_type' => 'Department',
                'entity_id' => $department->id,
                'metadata' => json_encode(['details' => 'Created department: '.$department->name]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Department created successfully.');
    }

    public function index(Request $request): Response
    {
        $barangayId =$request->user()->barangay_id;

        $personnelUsers = User::where('barangay_id',$barangayId)->where('role', 'personnel')->get();
        foreach ($personnelUsers as$user) {
            Personnel::firstOrCreate(['user_id' => $user->id], ['is_active' =>$user->is_active]);
        }

        $barangay =$request->user()->barangay;
        $nextAccountId = LocalIdentifier::next($barangay, LocalIdentifier::PER);

        $query = Personnel::with('user')
            ->whereHas('user', function ($q) use ($barangayId) {
                $q->where('barangay_id',$barangayId)->where('role', 'personnel');
            });

        if ($request->filled('department')) {
            $query->where('department',$request->department);
        }

        $personnel = $query->latest()->get()->map(function ($p) {
            $middle = trim($p->user?->middle_name ?? '');
            $cleanMiddle = (!empty($middle) && strtoupper($middle) !== 'N/A') ? $middle : '';$fullName = trim(sprintf('%s %s %s %s', $p->user?->first_name ?? '', $cleanMiddle, $p->user?->last_name ?? '', $p->user?->name_extension ?? ''));

            return [
                'id' => $p->id,
                'account_id' => $p->user?->account_id,
                'role' => $p->role,
                'department' => $p->department,
                'first_name' => $p->user?->first_name,
                'middle_name' => $p->user?->middle_name,
                'last_name' => $p->user?->last_name,
                'name_extension' => $p->user?->name_extension,
                'name' => preg_replace('/\s+/', ' ', $fullName),
                'birthday' => $p->birthday?->format('M d, Y'),
                'email' => $p->user?->email,
                'mobile' => $p->user?->mobile,
                'is_active' => (bool)($p->user?->is_active ?? $p->is_active),
                'created_at' => $p->user?->created_at?->format('M d, Y') ?? $p->created_at->format('M d, Y'),
            ];
        });

        $departments = $this->getAvailableDepartments($barangayId);

        return Inertia::render('Admin/Personnel/Index', [
            'personnel' => $personnel,
            'departments' => $departments,
            'department_roles' => $this->getDepartmentRoleOptions($barangayId),
            'next_account_id' => $nextAccountId,
            'current_department' => $request->department
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $validated =$request->validate([
            'account_id' => ['required', 'string', 'max:64', 'unique:users,account_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'name_extension' => ['nullable', 'string', 'max:20'],
            'birthday' => ['nullable', 'date'],
            'email' => ['nullable', 'email', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6'],
            'department' => ['required', 'string', 'max:50'],
            'role' => ['required', 'string', 'max:255'],
        ]);
        $validated['department'] = preg_replace('/\s+/', ' ', trim($validated['department']));
        $validated['role'] = trim($validated['role']);

        $barangayId =$request->user()->barangay_id;
        if (! collect($this->getDepartmentRoleOptions($barangayId)[$validated['department']] ?? [])
            ->contains('value', $validated['role'])) {
            return back()->withErrors(['role' => 'Select a role already registered for this department.'])->withInput();
        }

        DB::transaction(function () use ($validated,$barangayId, $request) {$user = User::create([
                'barangay_id' => $barangayId,
                'account_id' => $validated['account_id'],
                'role' => 'personnel',
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'name_extension' => $validated['name_extension'] ?? null,
                'email' => $validated['email'] ?? null,
                'mobile' => $validated['mobile'] ?? null,
                'password' => Hash::make($validated['password']),
                'is_active' => 1,
            ]);

            $personnel = Personnel::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'birthday' => $validated['birthday'] ?? null,
                'role' => $validated['role'],
                'department' => $validated['department'],
                'is_active' => 1,
            ]);
            Department::firstOrCreate([
                'barangay_id' => $barangayId,
                'name' => trim(preg_replace('/\s+/', ' ', $validated['department'])),
            ]);

            $fullName = trim("{$validated['first_name']} {$validated['last_name']}");

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'CREATE',
                'entity_type' => 'Personnel',
                'entity_id' => $personnel->id,
                'metadata' => json_encode(['details' => 'Created personnel account: ' . $fullName]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Personnel account successfully created!');
    }

    public function updateRole(Request $request, string$id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $validated =$request->validate([
            'role' => ['required', 'string', 'max:255'],
            'department' => ['required', 'string', 'max:50'],
        ]);
        $validated['department'] = preg_replace('/\s+/', ' ', trim($validated['department']));
        $validated['role'] = trim($validated['role']);

        $personnel = Personnel::with('user')->findOrFail($id);

        if ($personnel->user->barangay_id !==$request->user()->barangay_id) {
            abort(403);
        }

        if (! collect($this->getDepartmentRoleOptions($request->user()->barangay_id)[$validated['department']] ?? [])
            ->contains('value', $validated['role'])) {
            return back()->withErrors(['role' => 'Select a role already registered for this department.'])->withInput();
        }

        if (
            ($personnel->role !== $validated['role'] || $personnel->department !== $validated['department'])
            && $this->hasOpenAssignments($personnel)
        ) {
            return back()->withErrors(['role' => "Reassign or close this personnel member's active missions before changing their role."]);
        }

        $personnel->update([
            'role' => $validated['role'],
            'department' => $validated['department'],
        ]);

        return back()->with('success', 'Personnel role updated successfully.');
    }

    public function updateInformation(Request $request, string$id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $validated =$request->validate([
            'department' => ['required', 'string', 'max:50'],
            'role' => ['required', 'string', 'max:255'],
            'birthday' => ['nullable', 'date'],
            'email' => ['nullable', 'email', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:active,inactive'],
        ]);
        $validated['department'] = preg_replace('/\s+/', ' ', trim($validated['department']));
        $validated['role'] = trim($validated['role']);

        $personnel = Personnel::with('user')->findOrFail($id);

        if ($personnel->user->barangay_id !==$request->user()->barangay_id) {
            abort(403);
        }

        if (! collect($this->getDepartmentRoleOptions($request->user()->barangay_id)[$validated['department']] ?? [])
            ->contains('value', $validated['role'])) {
            return back()->withErrors(['role' => 'Select a role already registered for this department.'])->withInput();
        }

        if (
            ($personnel->role !== $validated['role'] || $personnel->department !== $validated['department'])
            && $this->hasOpenAssignments($personnel)
        ) {
            return back()->withErrors([
                'role' => "Reassign or close this personnel member's active missions before changing their department or role.",
            ]);
        }

        DB::transaction(function () use ($personnel, $validated) {
            Department::firstOrCreate([
                'barangay_id' => $personnel->user->barangay_id,
                'name' => trim(preg_replace('/\s+/', ' ', $validated['department'])),
            ]);

            $personnel->update([
                'role' => $validated['role'],
                'department' => $validated['department'],
                'birthday' => $validated['birthday'] ?? null,
                'is_active' => $validated['status'] === 'active',
            ]);

            $personnel->user->update([
                'email' => $validated['email'] ?? null,
                'mobile' => $validated['mobile'] ?? null,
                'is_active' => $validated['status'] === 'active',
            ]);
        });

        return back()->with('success', 'Personnel information updated successfully.');
    }

    private function hasOpenAssignments(Personnel $personnel): bool
    {
        return $personnel->missions()
            ->whereIn('missions.status', ['assigned', 'acknowledged', 'in_progress'])
            ->exists();
    }

    public function archive(Request $request, string$id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId =$request->user()->barangay_id;
        $personnel = Personnel::with('user')->findOrFail($id);

        if ($personnel->user->barangay_id !==$barangayId) {
            abort(403);
        }

        if ($this->hasOpenAssignments($personnel)) {
            return back()->with('error', "Cannot archive: This personnel member has active mission assignments.");
        }

        DB::transaction(function () use ($personnel,$barangayId, $request) {$name = trim(($personnel->user->first_name ?? '') . ' ' . ($personnel->user->last_name ?? ''));
            
            // Set both the user and personnel to inactive instead of deleting
            $personnel->update(['is_active' => false]);$personnel->user->update(['is_active' => false]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'UPDATE',
                'entity_type' => 'Personnel',
                'entity_id' => $personnel->id,
                'metadata' => json_encode(['details' => 'Archived personnel account: ' . $name]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Personnel account successfully archived.');
    }
}