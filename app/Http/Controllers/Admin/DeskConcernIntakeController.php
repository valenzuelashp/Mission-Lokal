<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ConcernStatus;
use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ConcernCategory;
use App\Models\ConcernStatusHistory;
use App\Models\ConcernSubcategory;
use App\Services\Concerns\FileUploadService;
use App\Support\MapHelpers;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DeskConcernIntakeController extends Controller
{
    public function create(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;
        $categories = ConcernCategory::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('barangay_id')->orWhere('barangay_id', $barangayId))
            ->orderBy('sort_order')
            ->get()
            ->map(function (ConcernCategory $category) {
                return [
                    'id' => $category->id,
                    'code' => $category->code,
                    'name' => $category->name,
                    'subcategories' => ConcernSubcategory::query()
                        ->where('category_id', $category->id)
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get(['id', 'code', 'name', 'force_private'])
                        ->map(fn (ConcernSubcategory $subcategory) => [
                            'id' => $subcategory->id,
                            'code' => $subcategory->code,
                            'name' => $subcategory->name,
                            'force_private' => (bool) $subcategory->force_private,
                        ])
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('Admin/Reports/Intake', [
            'categories' => $categories,
            'mapCenter' => [14.5173079, 120.9933811],
            'barangayBounds' => [
                [14.5059, 120.9766288],
                [14.5235931, 121.0011399],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'intake_channel' => ['required', Rule::in(['phone', 'walk_in'])],
            'intake_reporter_name' => ['required', 'string', 'max:255'],
            'intake_reporter_phone' => ['nullable', 'string', 'max:40'],
            'intake_reporter_address' => ['nullable', 'string', 'max:512'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10', 'max:10000'],
            'incident_occurred_at' => ['nullable', 'date', 'before_or_equal:now'],
            'category_id' => ['required', 'integer', 'exists:concern_categories,id'],
            'subcategory_id' => ['nullable', 'integer', 'exists:concern_subcategories,id'],
            'incident_location' => ['required', 'string', 'max:512'],
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'visibility' => ['required', Rule::in(['public', 'private'])],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $barangayId = $request->user()->barangay_id;
        $category = ConcernCategory::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('barangay_id')->orWhere('barangay_id', $barangayId))
            ->findOrFail($validated['category_id']);
        $subcategory = null;

        if (! empty($validated['subcategory_id'])) {
            $subcategory = ConcernSubcategory::query()
                ->where('category_id', $category->id)
                ->where('is_active', true)
                ->findOrFail($validated['subcategory_id']);
        }

        $isVawc = Concern::isVawcReport(
            strtolower((string) ($subcategory?->code ?? $category->code)),
            $validated['title'],
            $validated['description'],
        ) || strtoupper((string) $subcategory?->code) === 'VAWC';
        $forcePrivate = $validated['visibility'] === 'private'
            || $isVawc
            || (bool) $subcategory?->force_private;
        $visibility = $forcePrivate ? 'private' : 'public';

        $concern = DB::transaction(function () use ($request, $validated, $barangayId, $subcategory, $visibility, $forcePrivate) {
            $concern = Concern::create([
                'barangay_id' => $barangayId,
                'reporter_id' => null,
                'intake_logged_by' => $request->user()->id,
                'intake_channel' => $validated['intake_channel'],
                'intake_reporter_name' => trim($validated['intake_reporter_name']),
                'intake_reporter_phone' => isset($validated['intake_reporter_phone']) ? trim($validated['intake_reporter_phone']) : null,
                'intake_reporter_address' => isset($validated['intake_reporter_address']) ? trim($validated['intake_reporter_address']) : null,
                'title' => trim($validated['title']),
                'description' => trim($validated['description']),
                'incident_occurred_at' => $validated['incident_occurred_at'] ?? null,
                'category_id' => $validated['category_id'],
                'subcategory_id' => $subcategory?->id,
                'visibility' => $visibility,
                'status' => ConcernStatus::Submitted,
                'location' => MapHelpers::pointFromLatLng((float) $validated['lat'], (float) $validated['lng']),
                'address_text' => trim($validated['incident_location']),
                'is_blotter_candidate' => $forcePrivate,
                'severity_confirmed' => false,
            ]);

            foreach ($request->file('images', []) as $index => $file) {
                $path = app(FileUploadService::class)->upload($file, 'concerns', 'image', true);
                $concern->media()->create([
                    'id' => (string) Str::uuid(),
                    'storage_key' => $path,
                    'mime_type' => $file->getMimeType(),
                    'sort_order' => $index,
                ]);
            }

            ConcernStatusHistory::create([
                'concern_id' => $concern->id,
                'from_status' => null,
                'to_status' => ConcernStatus::Submitted,
                'actor_id' => $request->user()->id,
                'note' => 'Concern logged by the barangay desk via ' . str_replace('_', ' ', $validated['intake_channel']) . '.',
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => $request->user()->id,
                'action' => 'DESK_INTAKE',
                'entity_type' => 'Concern',
                'entity_id' => $concern->id,
                'metadata' => json_encode(['channel' => $validated['intake_channel']]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            return $concern;
        });

        if (! config('services.gemini.key') || config('queue.default') === 'sync') {
            \App\Jobs\Ai\ProcessConcernWithAi::dispatchSync($concern);
        } else {
            \App\Jobs\Ai\ProcessConcernWithAi::dispatch($concern);
        }

        return redirect()->route('admin.reports.index')->with('success', 'Desk concern logged and submitted for AI triage. No resident account was created.');
    }
}