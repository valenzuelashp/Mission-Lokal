<?php

namespace App\Http\Controllers\Resident;

use App\Enums\ConcernCategoryCode;
use App\Enums\ConcernStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConcernRequest;
use App\Jobs\Ai\ProcessConcernWithAi;
use App\Jobs\GeocodeConcernAddress;
use App\Models\Announcement;
use App\Models\Concern;
use App\Models\ConcernCategory;
use App\Models\ConcernStatusHistory;
use App\Models\ConcernSubcategory;
use App\Models\ConcernVote;
use App\Models\MissionResolutionPost;
use App\Services\Concerns\ConcernClassification;
use App\Services\Concerns\FileUploadService;
use App\Support\ConcernStatusUpdate;
use App\Support\MapHelpers;
use App\Support\SensitiveMediaUrl;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
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
        $search = mb_substr(trim((string) $request->query('search', '')), 0, 100);

        $userTotalReports = Concern::where('reporter_id', $user->id)->count();
        $userActiveReports = Concern::where('reporter_id', $user->id)
            ->whereIn('status', [ConcernStatus::Submitted, ConcernStatus::UnderReview, ConcernStatus::Active, 'submitted', 'under_review', 'active'])
            ->count();

        $concerns = Concern::query()
            ->select('concerns.*')
            ->selectRaw('ST_Y(concerns.location) as map_lat, ST_X(concerns.location) as map_lng')
            ->where('barangay_id', $user->barangay_id)
            ->where(function ($query) use ($user) {
                $query->where(fn ($public) => $public->publiclyDiscoverable())
                    ->orWhere('reporter_id', $user->id);
            })
            ->when($search !== '', function (Builder $query) use ($search) {
                $term = '%'.$search.'%';
                $query->where(function (Builder $matches) use ($term) {
                    $matches->where('concerns.title', 'like', $term)
                        ->orWhere('concerns.description', 'like', $term)
                        ->orWhere('concerns.address_text', 'like', $term)
                        ->orWhereHas('category', fn (Builder $category) => $category->where('name', 'like', $term));
                });
            })
            ->with([
                'reporter.residentProfile.badges',
                'category',
                'media',
                'subcategory',
                'mission',
                'statusHistory' => fn ($query) => $query
                    ->whereIn('to_status', ['submitted', 'active', 'rejected', 'spam', 'resolved', 'closed'])
                    ->orderBy('created_at')
                    ->orderBy('id'),
                'currentAiAnalysis.suggestedSubcategory',
                'votes' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->withCount([
                'votes as upvotes_count' => fn ($q) => $q->where('vote', 1),
                'votes as downvotes_count' => fn ($q) => $q->where('vote', -1),
                'clarifications as pending_clarifications_count' => fn ($q) => $q->whereNull('answered_at'),
            ])
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(function ($item) {
                $reporterName = trim(($item->reporter?->first_name ?? '').' '.($item->reporter?->last_name ?? ''));
                $reporterBadge = $item->reporter?->residentProfile?->badges?->last();
                $rawVote = $item->votes->first()?->vote;
                $statusStr = $item->status->value ?? $item->status;

                // Barangay updates are strictly hidden while awaiting admin review
                $latestResidentUpdate = null;
                if (! in_array($statusStr, ['submitted', 'ai_processed'], true)) {
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
                        ? collect()
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
                }

                $latestUpdateStatus = $latestResidentUpdate
                    ? ($latestResidentUpdate->to_status->value ?? $latestResidentUpdate->to_status)
                    : null;
                $point = $this->mapPoint($item);
                $isOwner = $item->reporter_id === auth()->id();

                return [
                    'id' => (string) $item->id,
                    'title' => $item->title,
                    'category' => $this->categoryName($item),
                    'severity' => $item->severity ?? 'medium',
                    'status' => $statusStr,
                    'upvotes' => (int) $item->upvotes_count,
                    'downvotes' => (int) $item->downvotes_count,
                    'user_vote' => ((int) $rawVote === 1) ? 'up' : (((int) $rawVote === -1) ? 'down' : null),
                    'location_label' => $item->locationLabel(),
                    'lat' => $point['lat'],
                    'lng' => $point['lng'],
                    'created_at' => $item->created_at ? $item->created_at->format('M d, Y · g:i A') : 'Just now',
                    'reporter_name' => $reporterName !== ''
                        ? $reporterName
                        : ($item->intake_channel !== 'resident_portal' ? 'Barangay Desk' : 'Verified Resident'),
                    'reporter_photo_url' => $item->reporter?->profilePhotoUrl(),
                    'reporter_badge' => $reporterBadge?->name,
                    'is_owner' => $isOwner,
                    'has_pending_clarification' => $isOwner
                        && $item->isAwaitingStaffDecision()
                        && $item->pending_clarifications_count > 0,
                    'visibility' => $item->visibility,
                    'privacy_locked' => $item->isSensitiveConcern(),
                    'images' => $item->media
                        ->sortBy('sort_order')
                        ->map(fn ($media) => app(SensitiveMediaUrl::class)->forConcern($item, $media))
                        ->values()
                        ->all(),
                    'latest_update' => $latestResidentUpdate ? [
                        'label' => ConcernStatusUpdate::label($latestUpdateStatus),
                        'message' => ConcernStatusUpdate::message(
                            $latestUpdateStatus,
                            $latestResidentUpdate->note,
                            $item->closed_summary,
                        ),
                        'at' => $latestResidentUpdate->created_at?->format('M d, Y · g:i A'),
                        ...(
                            in_array($latestUpdateStatus, ['active', 'resolved'], true)
                                ? ConcernStatusUpdate::plan($item->currentAiAnalysis)
                                : []
                        ),
                    ] : null,
                ];
            });

        $announcementsQuery = Announcement::query()
            ->where('is_published', true)
            ->with('creator')
            ->withCount('volunteers')
            ->withExists([
                'volunteers as joined' => fn ($query) => $query->where('user_id', $user->id),
            ]);

        if ($user->barangay_id) {
            $announcementsQuery->where('barangay_id', $user->barangay_id);
        }

        $announcements = $announcementsQuery
            ->latest('published_at')
            ->take(2)
            ->get()
            ->map(fn (Announcement $item) => $item->toResidentArray($user->id));

        $resolutionPosts = $this->publishedResolutionPosts($user->barangay_id)
            ->take(5)
            ->get()
            ->map(fn (MissionResolutionPost $post) => $this->formatResolutionPost($post));

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
            'announcements' => $announcements,
            'resolutionPosts' => $resolutionPosts,
            'search' => $search,
            ...$this->concernFormOptions(),
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

    private function categoryName(Concern $concern): string
    {
        $name = trim((string) ($concern->category?->name ?? ''));

        return $name !== '' ? $name : 'Other Concerns';
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
            ->map(fn ($media) => app(SensitiveMediaUrl::class)->forProof($post->mission, $media))
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

    public function create(): Response
    {
        return Inertia::render('Resident/Concerns/New', [
            ...$this->concernFormOptions(),
        ]);
    }

    private function concernFormOptions(): array
    {
        return [
            'categories' => ConcernCategoryCode::options(),
            'emergencyNotice' => ConcernClassification::EMERGENCY_NOTICE,
            'mapCenter' => [14.5173079, 120.9933811],
            'barangayBounds' => [
                [14.5059, 120.9766288],
                [14.5235931, 121.0011399],
            ],
        ];
    }

    public function store(StoreConcernRequest $request): RedirectResponse
    {
        if (app(ConcernClassification::class)->isActiveEmergency($request->title.' '.$request->description)) {
            throw ValidationException::withMessages(['description' => ConcernClassification::EMERGENCY_NOTICE]);
        }

        $user = auth()->user();

        if ($user->isMinor()) {
            if ($request->category_id === 'vawc' || $request->category_id === 'noise') {
                return back()->withErrors([
                    'category_id' => 'Minors are restricted from filing private disputes or noise/peace complaints. Please ask your parent or guardian to file this.',
                ]);
            }
        }

        $isVawcConcern = Concern::isVawcReport(
            $request->category_id,
            $request->title,
            $request->description,
        );
        $category = ConcernCategory::query()->whereNull('barangay_id')->where('is_active', true)->where('code', strtoupper($request->category_id))->firstOrFail();
        $categoryIdInt = $category->id;
        $subcategoryCode = $isVawcConcern
            ? 'VAWC'
            : ($request->category_id === 'noise' ? 'NOISE' : null);
        $subcategory = $subcategoryCode
            ? ConcernSubcategory::query()->where('code', $subcategoryCode)->first()
            : null;
        $subcategoryId = $subcategory?->id;
        $forcePrivate = Concern::shouldForcePrivate($request->category_id, $request->title, $request->description)
            || (bool) $subcategory?->force_private;
        $visibility = $forcePrivate ? 'private' : $request->input('visibility', 'public');
        $lat = (float) $request->lat;
        $lng = (float) $request->lng;
        $addressText = $forcePrivate ? null : "Coordinates: {$lat}, {$lng}";

        $concern = DB::transaction(function () use ($request, $user, $categoryIdInt, $subcategoryId, $isVawcConcern, $visibility, $forcePrivate, $lat, $lng, $addressText) {
            $createdConcern = Concern::create([
                'barangay_id' => $user->barangay_id,
                'reporter_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'incident_occurred_at' => $request->input('incident_occurred_at'),
                'category_id' => $categoryIdInt,
                'original_category_id' => $categoryIdInt,
                'subcategory_id' => $subcategoryId,
                'is_vawc' => $isVawcConcern,
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
                    try {
                        $path = $uploadService->upload($file, 'concerns', 'image', true);
                    } catch (\Throwable $e) {
                        throw ValidationException::withMessages([
                            'images' => 'One of the photos could not be saved. Use a JPG, PNG, or WebP under 4 MB.',
                        ]);
                    }

                    $createdConcern->media()->create([
                        'id' => Str::uuid()->toString(),
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

        if (! $forcePrivate) {
            GeocodeConcernAddress::dispatch((string) $concern->id, $lat, $lng)
                ->onConnection('database')
                ->afterCommit();
        }

        ProcessConcernWithAi::dispatch($concern)
            ->onConnection('database')
            ->afterCommit();

        return redirect()->route('feed')->with('success', 'Concern submitted successfully! AI is analyzing your report.');
    }

    public function edit(Request $request, Concern $concern): Response
    {
        abort_unless($concern->reporter_id === $request->user()->id && $concern->barangay_id === $request->user()->barangay_id, 404);
        abort_unless($concern->isAwaitingStaffDecision() && ! $concern->mission()->exists(), 403, 'This concern is already being handled.');
        $point = DB::selectOne('SELECT ST_X(location) as x, ST_Y(location) as y FROM concerns WHERE id = ?', [$concern->id]);
        $x = (float) ($point->x ?? 120.9933811);
        $y = (float) ($point->y ?? 14.5173079);

        return Inertia::render('Resident/Concerns/New', [...$this->concernFormOptions(), 'initialConcern' => [
            'id' => $concern->id, 'title' => $concern->title, 'description' => $concern->description,
            'category_id' => strtolower((string) $concern->category?->code), 'visibility' => $concern->visibility,
            'force_private' => $concern->isSensitiveConcern(), 'lat' => $x > 90 ? $y : $x, 'lng' => $x > 90 ? $x : $y,
            'existing_photo_count' => $concern->media()->count(),
        ]]);
    }

    public function update(StoreConcernRequest $request, Concern $concern): RedirectResponse
    {
        abort_unless($concern->reporter_id === $request->user()->id && $concern->barangay_id === $request->user()->barangay_id, 404);
        if (app(ConcernClassification::class)->isActiveEmergency($request->title.' '.$request->description)) {
            throw ValidationException::withMessages(['description' => ConcernClassification::EMERGENCY_NOTICE]);
        }
        if ($request->user()->isMinor() && in_array($request->category_id, ['vawc', 'noise'], true)) {
            throw ValidationException::withMessages(['category_id' => 'Please ask your parent or guardian to file a sensitive dispute.']);
        }
        $category = ConcernCategory::whereNull('barangay_id')->where('is_active', true)->where('code', strtoupper($request->category_id))->firstOrFail();
        DB::transaction(function () use ($request, $concern, $category) {
            $concern = Concern::whereKey($concern->id)->lockForUpdate()->firstOrFail();
            abort_unless($concern->isAwaitingStaffDecision() && ! $concern->mission()->exists(), 403, 'This concern is already being handled.');
            $private = $concern->isSensitiveConcern() || Concern::shouldForcePrivate($request->category_id, $request->title, $request->description);
            if ($concern->media()->count() + count($request->file('images', [])) > 4) {
                throw ValidationException::withMessages(['images' => 'A concern can contain up to four photos.']);
            }
            $concern->update([
                'title' => $request->title, 'description' => $request->description, 'category_id' => $category->id,
                'original_category_id' => $category->id, 'subcategory_id' => null, 'category_realignment_reason' => null,
                'visibility' => $private ? 'private' : $request->input('visibility', 'public'), 'is_vawc' => $concern->isVawcConcern() || Concern::isVawcReport($request->category_id, $request->title, $request->description),
                'status' => 'submitted', 'content_revision' => ($concern->content_revision ?? 1) + 1,
                'scope_status' => 'pending', 'scope_reason' => null, 'routed_department' => null, 'routed_roles' => null,
                'location' => MapHelpers::pointFromLatLng((float) $request->lat, (float) $request->lng),
                'address_text' => null, 'ai_processed_at' => null,
            ]);
            $concern->aiAnalyses()->update(['is_current' => false]);
            foreach ($request->file('images', []) as $file) {
                $path = app(FileUploadService::class)->upload($file, 'concerns', 'image', true);
                $concern->media()->create(['id' => (string) Str::uuid(), 'storage_key' => $path, 'mime_type' => $file->getMimeType(), 'sort_order' => $concern->media()->count()]);
            }
            ConcernStatusUpdate::record($concern, null, 'submitted', $request->user()->id, 'Resident edited the concern; queued for fresh analysis.');
            ProcessConcernWithAi::dispatch($concern)->onConnection('database')->afterCommit();
        });

        return redirect()->route('concerns.show', $concern)->with('success', 'Concern updated and queued for fresh analysis.');
    }

    public function show(Request $request, Concern $concern): Response
    {
        $user = $request->user();
        $concern->denyUnlessVisibleToResident($user);

        $concern->load('reporter.residentProfile.badges', 'category', 'currentAiAnalysis');
        $reporterName = trim(($concern->reporter?->first_name ?? '').' '.($concern->reporter?->last_name ?? ''));
        $reporterBadge = $concern->reporter?->residentProfile?->badges?->last();
        if ($reporterName === '' && $concern->intake_channel !== 'resident_portal') {
            $reporterName = 'Barangay Desk';
        }

        $locationData = DB::selectOne('SELECT ST_X(location) as x, ST_Y(location) as y FROM concerns WHERE id = ?', [$concern->id]);
        $lat = 14.5173079;
        $lng = 120.9933811;

        if ($locationData) {
            $x = (float) $locationData->x;
            $y = (float) $locationData->y;
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

        $statusStr = $concern->status->value ?? $concern->status;
        $isPendingReview = in_array($statusStr, ['submitted', 'ai_processed'], true);

        $statusHistory = DB::table('concern_status_history')
            ->where('concern_id', $concern->id)
            ->whereIn('to_status', ['submitted', 'active', 'rejected', 'spam', 'resolved', 'closed'])
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
            ->get();
        $missionCreated = $concern->mission()->exists();

        $timeline = [];
        if (! $isPendingReview) {
            $decisionIndex = $statusHistory->search(fn ($log) => ConcernStatusUpdate::isResidentDecision(
                $log->to_status,
                $log->note,
                $concern->closed_summary,
                $missionCreated,
            ));
            $decisionUpdates = $decisionIndex === false
                ? collect()
                : $statusHistory->slice($decisionIndex)
                    ->filter(fn ($log) => ConcernStatusUpdate::isResidentUpdate(
                        $log->to_status,
                        $log->note,
                        $concern->closed_summary,
                        $missionCreated,
                    ));
            $timeline = $decisionUpdates
                ->values()
                ->map(fn ($log) => [
                    'key' => (string) $log->id,
                    'label' => ConcernStatusUpdate::label($log->to_status),
                    'description' => ConcernStatusUpdate::message($log->to_status, $log->note, $concern->closed_summary),
                    'at' => Carbon::parse($log->created_at)->format('M d, Y g:i A'),
                    'state' => 'done',
                ])->toArray();
        }

        $responsePlan = $isPendingReview ? [
            'prescriptive_steps' => [],
            'estimated_duration' => null,
            'estimated_completion' => null,
        ] : ConcernStatusUpdate::plan($concern->currentAiAnalysis);
        $clarifications = $concern->reporter_id === $user->id
            ? $concern->clarifications
            : collect();
        $hasPendingClarification = $clarifications->contains(fn ($clarification) => $clarification->answered_at === null);

        return Inertia::render('Resident/Concerns/Show', [
            'concern' => [
                'id' => (string) $concern->id,
                'title' => $concern->title,
                'category' => $this->categoryName($concern),
                'category_realignment_reason' => $concern->reporter_id === $user->id ? $concern->category_realignment_reason : null,
                'scope_reason' => $concern->reporter_id === $user->id ? $concern->scope_reason : null,
                'can_edit' => $concern->reporter_id === $user->id && $concern->isAwaitingStaffDecision() && ! $missionCreated,
                'severity' => $concern->severity ?? 'medium',
                'status' => $statusStr,
                'visibility' => $concern->visibility,
                'description' => $concern->description,
                'location_label' => $concern->locationLabel(),
                'lat' => $lat,
                'lng' => $lng,
                'upvotes' => $upvotes,
                'downvotes' => $downvotes,
                'user_vote' => $userVote,
                'reporter_name' => $reporterName !== '' ? $reporterName : 'Verified Resident',
                'reporter_photo_url' => $concern->reporter?->profilePhotoUrl(),
                'reporter_badge' => $reporterBadge?->name,
                'created_at' => $concern->created_at ? $concern->created_at->format('M d, Y · g:i A') : '',
                'images' => $concern->media->map(fn ($media) => app(SensitiveMediaUrl::class)->forConcern($concern, $media))->toArray(),
                'timeline' => $timeline,
                'response_plan' => $responsePlan,
                'clarifications' => $clarifications->map->toThreadEntry()->values(),
                'has_pending_clarification' => $hasPendingClarification,
                'can_reply_to_clarification' => $concern->reporter_id === $user->id && $concern->isAwaitingStaffDecision(),
            ],
        ]);
    }

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

        if ($concern->isSensitiveConcern() && $validated['visibility'] !== 'private') {
            return back()->with('error', 'This concern was marked private for safety and cannot be made public.');
        }

        $concern->update(['visibility' => $validated['visibility']]);

        return back()->with('success', 'Post privacy updated successfully.');
    }

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
                Storage::disk('local')->delete($mediaItem->storage_key);
            }
            $concern->delete();
        });

        return redirect()->route('feed')->with('success', 'Report retracted successfully.');
    }
}
