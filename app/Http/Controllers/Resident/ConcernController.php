<?php

namespace App\Http\Controllers\Resident;

use App\Services\Concerns\FileUploadService;
use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ConcernStatusHistory;
use App\Support\ConcernStatusUpdate;
use App\Enums\ConcernStatus;
use App\Models\ConcernVote;
use App\Models\MissionResolutionPost;
use App\Services\Geocoding\ReverseGeocoder;
use App\Support\MapHelpers;
use Illuminate\Database\Eloquent\Builder;
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
        $concerns = Concern::query()
            ->select('concerns.*')
            ->selectRaw('ST_Y(concerns.location) as map_lat, ST_X(concerns.location) as map_lng')
            ->where('barangay_id', $user->barangay_id)
            ->where(function ($query) use ($user) {
                $query->where('visibility', 'public')
                      ->orWhere('reporter_id', $user->id);
            })
            ->with([
                'reporter',
                'media',
                'mission',
                'statusHistory' => fn ($query) => $query
                    ->whereIn('to_status', ['submitted', 'active', 'rejected', 'spam', 'resolved', 'closed'])
                    ->orderBy('created_at')
                    ->orderBy('id'),
                'currentAiAnalysis',
                'votes' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->withCount([
                'votes as upvotes_count' => fn($q) => $q->where('vote', 1),
                'votes as downvotes_count' => fn($q) => $q->where('vote', -1)
            ])
            ->latest()
            ->get()
            ->map(function ($item) {
                $reporterName = trim(($item->reporter?->first_name ?? '') . ' ' . ($item->reporter?->last_name ?? ''));
                $rawVote = $item->votes->first()?->vote;
                $history = $item->statusHistory;
                $decisionIndex = $history->search(function ($log) use ($item) {
                    $status = $log->to_status->value ?? $log->to_status;

                    return ConcernStatusUpdate::isResidentDecision(
                        $status,
                        $log->note,
                        $item->closed_summary,
                        $item->mission !== null,
                    );
                });
                $residentUpdates = $decisionIndex === false
                    ? $history->filter(fn ($log) => ($log->to_status->value ?? $log->to_status) === 'submitted')
                    : $history->slice($decisionIndex)
                        ->filter(function ($log) use ($item) {
                            $status = $log->to_status->value ?? $log->to_status;

                            return ConcernStatusUpdate::isResidentUpdate(
                                $status,
                                $log->note,
                                $item->closed_summary,
                                $item->mission !== null,
                            );
                        });
                $latestResidentUpdate = $residentUpdates->last();
                $latestUpdateStatus = $latestResidentUpdate
                    ? ($latestResidentUpdate->to_status->value ?? $latestResidentUpdate->to_status)
                    : null;
                $point = $this->mapPoint($item);
                
                return [
                    'id' => (string) $item->id,
                    'title' => $item->title,
                    'category' => ucwords(str_replace('_', ' ', $item->category_id)),
                    'severity' => $item->severity ?? 'medium',
                    'status' => $item->status->value ?? $item->status, 
                    'upvotes' => (int) $item->upvotes_count,
                    'downvotes' => (int) $item->downvotes_count,
                    'user_vote' => ((int) $rawVote === 1) ? 'up' : (((int) $rawVote === -1) ? 'down' : null),
                    'location_label' => $item->locationLabel(),
                    'lat' => $point['lat'],
                    'lng' => $point['lng'],
                    'created_at' => $item->created_at ? $item->created_at->format('M d, Y · g:i A') : 'Just now',
                    'reporter_name' => $reporterName !== '' ? $reporterName : 'Verified Resident',
                    'is_owner' => $item->reporter_id === auth()->id(),
                    'visibility' => $item->visibility,
                    'privacy_locked' => (bool) $item->is_blotter_candidate,
                    'images' => $item->media->take(1)->map(fn($m) => asset('storage/' . $m->storage_key))->toArray(),
                    'latest_update' => $latestResidentUpdate ? [
                        'label' => ConcernStatusUpdate::label($latestUpdateStatus),
                        'message' => ConcernStatusUpdate::message(
                            $latestUpdateStatus,
                            $latestResidentUpdate->note,
                            $item->closed_summary,
                        ),
                        'at' => $latestResidentUpdate->created_at?->format('M d, Y · g:i A'),
                        ...(
                            $latestUpdateStatus === 'active'
                                ? ConcernStatusUpdate::plan($item->currentAiAnalysis)
                                : []
                        ),
                    ] : null,
                ];
            });

        $resolutionPosts = $this->publishedResolutionPosts($user->barangay_id)
            ->take(5)
            ->get()
            ->map(fn (MissionResolutionPost $post) => $this->formatResolutionPost($post));

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
            'resolutionPosts' => $resolutionPosts,
            'userStats' => [
                'total_reports' => $userTotalReports,
                'active_reports' => $userActiveReports,
            ],
        ]);
    }

    public function resolutions(Request $request): Response
    {
        $user = $request->user();

        $resolutionPosts = $this->publishedResolutionPosts($user->barangay_id)
            ->paginate(12)
            ->through(fn (MissionResolutionPost $post) => $this->formatResolutionPost($post));

        return Inertia::render('Resident/Resolutions', [
            'resolutionPosts' => $resolutionPosts,
        ]);
    }

    /**
     * @return array{lat: float|null, lng: float|null}
     */
    private function mapPoint(object $item): array
    {
        if ($item->map_lat === null || $item->map_lng === null) {
            return ['lat' => null, 'lng' => null];
        }

        $lat = (float) $item->map_lat;
        $lng = (float) $item->map_lng;

        if (abs($lat) > 90 && abs($lng) <= 90) {
            return ['lat' => $lng, 'lng' => $lat];
        }

        return ['lat' => $lat, 'lng' => $lng];
    }

    private function publishedResolutionPosts(string $barangayId): Builder
    {
        return MissionResolutionPost::query()
            ->where('is_published', true)
            ->whereHas('mission.concern', function ($query) use ($barangayId) {
                $query->where('barangay_id', $barangayId)
                    ->where('visibility', 'public')
                    ->where('is_blotter_candidate', false);
            })
            ->with(['mission.concern', 'mission.personnel.user', 'mission.proof.media'])
            ->latest('published_at');
    }

    private function formatResolutionPost(MissionResolutionPost $post): array
    {
        $mission = $post->mission;
        $proofMedia = $mission?->proof?->media ?? collect();
        $photos = $proofMedia
            ->whereIn('id', $post->media_ids ?? [])
            ->map(fn ($media) => asset('storage/'.$media->storage_key))
            ->values()
            ->all();

        return [
            'id' => (string) $post->id,
            'title' => $post->title,
            'body' => $post->body,
            'photos' => $photos,
            'published_at' => $post->published_at?->timezone('Asia/Manila')->format('M d, Y g:i A'),
            'mission_id' => $mission?->id,
        ];
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
            
            'mapCenter' => [14.5173079, 120.9933811],
            
            'barangayBounds' => [
                [14.5059, 120.9766288],
                [14.5235931, 121.0011399],
            ],
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
        $lat = (float) $request->lat;
        $lng = (float) $request->lng;
        $addressText = $forcePrivate
            ? null
            : app(ReverseGeocoder::class)->label($lat, $lng);
        $addressText ??= "Coordinates: {$lat}, {$lng}";
        
        $concern = DB::transaction(function () use ($request, $user, $categoryIdInt, $visibility, $forcePrivate, $lat, $lng, $addressText) {
            $createdConcern = Concern::create([
                'barangay_id' => $user->barangay_id,
                'reporter_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'category_id' => $categoryIdInt,
                'visibility' => $visibility, 
                'status' => ConcernStatus::Submitted, 
                'location' => MapHelpers::pointFromLatLng($lat, $lng),
                'address_text' => $addressText,
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

        $concern->load('reporter', 'currentAiAnalysis');
        $reporterName = trim(($concern->reporter?->first_name ?? '') . ' ' . ($concern->reporter?->last_name ?? ''));

        // Determine lat/lng correctly regardless of whether location is stored (lng, lat) or (lat, lng)
        $locationData = DB::selectOne("SELECT ST_X(location) as x, ST_Y(location) as y FROM concerns WHERE id = ?", [$concern->id]);
        $lat = 14.5173079;
        $lng = 120.9933811;

        if ($locationData) {
            $x = (float) $locationData->x;
            $y = (float) $locationData->y;
            // In GIS, the coordinate with value > 90 is always Longitude
            if ($x > 90) {
                $lng = $x;
                $lat = $y;
            } else {
                $lat = $x;
                $lng = $y;
            }
        }

        $upvotes = $concern->votes()->where('vote', 1)->count();
        $downvotes = $concern->votes()->where('vote', -1)->count();
        $rawVote = $concern->votes()->where('user_id', $user->id)->value('vote');
        $userVote = ((int) $rawVote === 1) ? 'up' : (((int) $rawVote === -1) ? 'down' : null);

        $statusHistory = DB::table('concern_status_history')
            ->where('concern_id', $concern->id)
            ->whereIn('to_status', ['submitted', 'active', 'rejected', 'spam', 'resolved', 'closed'])
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->get();
        $missionCreated = $concern->mission()->exists();

        $decisionIndex = $statusHistory->search(fn ($log) => ConcernStatusUpdate::isResidentDecision(
            $log->to_status,
            $log->note,
            $concern->closed_summary,
            $missionCreated,
        ));
        $submittedUpdates = $statusHistory
            ->filter(fn ($log) => $log->to_status === 'submitted');
        $decisionUpdates = $decisionIndex === false
            ? collect()
            : $statusHistory->slice($decisionIndex)
                ->filter(fn ($log) => ConcernStatusUpdate::isResidentUpdate(
                    $log->to_status,
                    $log->note,
                    $concern->closed_summary,
                    $missionCreated,
                ));
        $timeline = $submittedUpdates
            ->concat($decisionUpdates)
            ->values()
            ->map(fn ($log) => [
                    'key' => (string) $log->id,
                    'label' => ConcernStatusUpdate::label($log->to_status),
                    'description' => ConcernStatusUpdate::message($log->to_status, $log->note, $concern->closed_summary),
                    'at' => \Carbon\Carbon::parse($log->created_at)->format('M d, Y g:i A'),
                    'state' => 'done',
                ])->toArray();

        return Inertia::render('Resident/Concerns/Show', [
            'concern' => [
                'id' => (string) $concern->id,
                'title' => $concern->title,
                'category' => ucwords(str_replace('_', ' ', $concern->category_id)),
                'severity' => $concern->severity ?? 'medium',
                'status' => $concern->status->value ?? $concern->status,
                'description' => $concern->description,
                'location_label' => $concern->locationLabel(),
                'lat' => $lat,
                'lng' => $lng,
                'upvotes' => $upvotes,
                'downvotes' => $downvotes,
                'user_vote' => $userVote,
                'reporter_name' => $reporterName !== '' ? $reporterName : 'Verified Resident',
                'created_at' => $concern->created_at ? $concern->created_at->format('M d, Y · g:i A') : '',
                'images' => $concern->media->map(fn($m) => asset('storage/' . $m->storage_key))->toArray(),
                'timeline' => $timeline,
                'response_plan' => ConcernStatusUpdate::plan($concern->currentAiAnalysis),
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