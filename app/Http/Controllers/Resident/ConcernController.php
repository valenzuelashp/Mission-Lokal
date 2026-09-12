<?php

namespace App\Http\Controllers\Resident;

use App\Services\Concerns\FileUploadService;
use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ConcernStatusHistory;
use App\Enums\ConcernStatus;
use App\Models\ConcernVote;
use App\Support\MapHelpers;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ConcernController extends Controller
{
    /**
     * R8: Display the collective Public Community Concern Feed.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Compute personal report metrics for the logged-in resident only
        $userTotalReports = Concern::where('reporter_id', $user->id)->count();
        $userActiveReports = Concern::where('reporter_id', $user->id)
            ->whereIn('status', [ConcernStatus::Submitted, ConcernStatus::UnderReview, ConcernStatus::Active, 'submitted', 'under_review', 'active'])
            ->count();

        // 2. Row-level access query rules for private vs public visibility bounds on the feed
        $concerns = Concern::where('barangay_id', $user->barangay_id)
            ->where(function ($query) use ($user) {
                $query->where('visibility', 'public')
                      ->orWhere('reporter_id', $user->id);
            })
            ->with(['reporter', 'media', 'votes' => fn ($query) => $query->where('user_id', $user->id)])
            ->withCount([
                'votes as upvotes_count' => fn($q) => $q->where('vote', 1),
                'votes as downvotes_count' => fn($q) => $q->where('vote', -1)
            ])
            ->latest()
            ->get()
            ->map(function ($item) {
                $reporterName = trim(($item->reporter?->first_name ?? '') . ' ' . ($item->reporter?->last_name ?? ''));
                $rawVote = $item->votes->first()?->vote;
                
                return [
                    'id' => (string) $item->id,
                    'title' => $item->title,
                    'category' => ucwords(str_replace('_', ' ', $item->category_id)),
                    'severity' => $item->severity ?? 'medium',
                    'status' => $item->status->value ?? $item->status, 
                    'upvotes' => (int) $item->upvotes_count,
                    'downvotes' => (int) $item->downvotes_count,
                    'user_vote' => ((int) $rawVote === 1) ? 'up' : (((int) $rawVote === -1) ? 'down' : null),
                    'location_label' => $item->address_text ?? 'Pinpointed Coordinates',
                    'created_at' => $item->created_at ? $item->created_at->format('M d, Y · g:i A') : 'Just now',
                    'reporter_name' => $reporterName !== '' ? $reporterName : 'Verified Resident',
                    'is_owner' => $item->reporter_id === auth()->id(),
                    'visibility' => $item->visibility,
                    'privacy_locked' => (bool) $item->is_blotter_candidate,
                    'images' => $item->media->take(1)->map(fn($m) => asset('storage/' . $m->storage_key))->toArray(),
                ];
            });

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
            'userStats' => [
                'total_reports' => $userTotalReports,
                'active_reports' => $userActiveReports,
            ],
        ]);
    }

    /**
     * R9: Render the Post New Concern view setup.
     */
    public function create(): Response
    {
        return Inertia::render('Resident/Concerns/New', [
            'categories' => [
                ['value' => 'fire', 'label' => 'Fire Hazard'],
                ['value' => 'flood', 'label' => 'Flooding & Drainage'],
                ['value' => 'waste', 'label' => 'Solid Waste & Illegal Dumping'],
                ['value' => 'noise', 'label' => 'Noise Disturbance'],
                ['value' => 'light', 'label' => 'Infrastructure & Utilities'],
                ['value' => 'vawc', 'label' => 'VAWC / Domestic Dispute'],
            ],
            
            'mapCenter' => [14.5151, 120.9939],
            
            'barangayBounds' => [
                [14.50820, 120.97668], 
                [14.52547, 121.00114]  
            ]
        ]);
    }

    /**
     * R9: Save formal community concern report records using atomic transactions.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'category_id' => ['required', 'string'],
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $user = auth()->user();

        if ($user->isMinor()) {
            if ($request->category_id === 'vawc' || $request->category_id === 'noise') {
                return back()->withErrors([
                    'category_id' => 'Minors are restricted from filing private disputes or noise/peace complaints. Please ask your parent or guardian to file this.'
                ]);
            }
        }

        $categoryMap = [
            'infrastructure' => 1,
            'light' => 1,     
            'flood' => 2,     
            'waste' => 2,     
            'noise' => 3,     
            'fire' => 1,      
            'vawc' => 4,      
        ];

        $categoryIdInt = $categoryMap[$request->category_id] ?? 1;
        $forcePrivate = Concern::shouldForcePrivate(
            $request->category_id,
            $request->title ?? '',
            $request->description ?? ''
        );
        $visibility = $forcePrivate ? 'private' : 'public';
        
        $concern = DB::transaction(function () use ($request, $user, $categoryIdInt, $visibility, $forcePrivate) {
            $createdConcern = Concern::create([
                'barangay_id' => $user->barangay_id,
                'reporter_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'category_id' => $categoryIdInt,
                'visibility' => $visibility, 
                'status' => ConcernStatus::Submitted, 
                'location' => MapHelpers::pointFromLatLng((float) $request->lat, (float) $request->lng),
                'address_text' => $request->address_text ?? "Coordinates: {$request->lat}, {$request->lng}",
                'is_blotter_candidate' => $forcePrivate,
                'severity_confirmed' => false,
            ]);

            if ($request->hasFile('images')) {
                $uploadService = app(FileUploadService::class);

                foreach ($request->file('images') as $index => $file) {
                    $path = $uploadService->upload($file, 'concerns', 'image');

                    $createdConcern->media()->create([
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'storage_key' => $path,
                        'mime_type' => $file->getMimeType(),
                        'sort_order' => $index,
                    ]);
                }
            }

            ConcernStatusHistory::create([
                'concern_id' => $createdConcern->id,
                'from_status' => null,
                'to_status' => 'submitted',
                'actor_id' => $user->id,
                'note' => 'Concern posted by resident.',
            ]);
            
            return $createdConcern;
        });

        if (! config('services.gemini.key') || config('queue.default') === 'sync') {
            \App\Jobs\Ai\ProcessConcernWithAi::dispatchSync($concern);
        } else {
            \App\Jobs\Ai\ProcessConcernWithAi::dispatch($concern);
        }

        return redirect()->route('feed')->with('success', 'Concern submitted successfully! AI is analyzing your report.');
    }

    /**
     * R10: Render specific details with row-level authorization boundaries.
     */
    public function show(Request $request, Concern $concern): Response
    {
        $user = $request->user();
        $concern->denyUnlessVisibleToResident($user);

        $concern->load('reporter');
        $reporterName = trim(($concern->reporter?->first_name ?? '') . ' ' . ($concern->reporter?->last_name ?? ''));

        $locationData = DB::selectOne("SELECT ST_X(location) as lat, ST_Y(location) as lng FROM concerns WHERE id = ?", [$concern->id]);

        $upvotes = $concern->votes()->where('vote', 1)->count();
        $downvotes = $concern->votes()->where('vote', -1)->count();
        $rawVote = $concern->votes()->where('user_id', $user->id)->value('vote');
        $userVote = ((int) $rawVote === 1) ? 'up' : (((int) $rawVote === -1) ? 'down' : null);

        $timeline = DB::table('concern_status_history')
            ->where('concern_id', $concern->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($log) => [
                'key' => (string) $log->id,
                'label' => ucwords(str_replace('_', ' ', $log->to_status)),
                'description' => $log->note,
                'at' => \Carbon\Carbon::parse($log->created_at)->format('M d, Y g:i A'),
                'state' => 'done'
            ])->toArray();

        if (empty($timeline)) {
            $timeline[] = [
                'key' => 'initial',
                'label' => 'Submitted',
                'description' => 'Concern successfully logged for review.',
                'at' => $concern->created_at->format('M d, Y g:i A'),
                'state' => 'current'
            ];
        }

        return Inertia::render('Resident/Concerns/Show', [
            'concern' => [
                'id' => (string) $concern->id,
                'title' => $concern->title,
                'category' => ucwords(str_replace('_', ' ', $concern->category_id)),
                'severity' => $concern->severity ?? 'medium',
                'status' => $concern->status->value ?? $concern->status,
                'description' => $concern->description,
                'location_label' => $concern->address_text ?? 'Pinpointed Location',
                'lat' => $locationData ? $locationData->lat : 14.6507,
                'lng' => $locationData ? $locationData->lng : 120.9793,
                'upvotes' => $upvotes,
                'downvotes' => $downvotes,
                'user_vote' => $userVote,
                'reporter_name' => $reporterName !== '' ? $reporterName : 'Verified Resident',
                'created_at' => $concern->created_at ? $concern->created_at->format('M d, Y · g:i A') : '',
                'images' => $concern->media->map(fn($m) => asset('storage/' . $m->storage_key))->toArray(),
                'timeline' => $timeline
            ]
        ]);
    }

    /**
     * Complete, Idempotent Voting Engine Pipeline with Toggle Inversions.
     */
    public function vote(Request $request, Concern $concern): RedirectResponse
    {
        $request->validate([
            'vote' => ['nullable', 'in:up,down'],
            'type' => ['nullable', 'in:up,down'],
        ]);

        $user = $request->user();
        $concern->denyUnlessVisibleToResident($user);
        $direction = $request->input('vote', $request->input('type'));
        if (! in_array($direction, ['up', 'down'], true)) {
            return back()->with('error', 'Invalid vote.');
        }
        $value = $direction === 'down' ? -1 : 1;

        if ($concern->reporter_id === $user->id) {
            return back()->with('error', 'You cannot vote on your own community report submission.');
        }

        $existingVote = ConcernVote::where('concern_id', $concern->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            if ((int) $existingVote->vote === $value) {
                ConcernVote::where('concern_id', $concern->id)
                    ->where('user_id', $user->id)
                    ->delete();
            } else {
                ConcernVote::where('concern_id', $concern->id)
                    ->where('user_id', $user->id)
                    ->update(['vote' => $value]);
            }
        } else {
            ConcernVote::create([
                'concern_id' => $concern->id,
                'user_id' => $user->id,
                'vote' => $value,
            ]);
        }

        return back();
    }

    public function updateVisibility(Request $request, Concern $concern): RedirectResponse
    {
        if ($concern->reporter_id !== $request->user()->id) {
            abort(403, 'Unauthorized row update.');
        }

        $validated = $request->validate([
            'visibility' => ['required', 'in:public,private'],
        ]);

        if ($concern->is_blotter_candidate && $validated['visibility'] !== 'private') {
            return back()->with('error', 'This concern was marked private for safety and cannot be made public.');
        }

        $concern->update(['visibility' => $validated['visibility']]);

        return back()->with('success', 'Post privacy updated successfully.');
    }

    /**
     * Clean Lifecycle Mutator Rule: Revoke or delete report records before review actions occur.
     */
    public function destroy(Request $request, Concern $concern): RedirectResponse
    {
        if ($concern->reporter_id !== $request->user()->id) {
            abort(403, 'Unauthorized row lifecycle action.');
        }

        if (! in_array($concern->status, [ConcernStatus::Submitted, ConcernStatus::Rejected], true)) {
            return back()->with('error', 'This concern is currently being processed by your barangay team and is locked.');
        }

        DB::transaction(function () use ($concern) {
            foreach ($concern->media as $mediaItem) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($mediaItem->storage_key);
            }
            $concern->delete();
        });

        return redirect()->route('feed')->with('success', 'Report retracted successfully.');
    }
}