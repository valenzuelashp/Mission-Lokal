<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest as DocumentRequestModel;
use App\Models\DocumentTemplate;
use App\Services\Documents\DocumentCatalog;
use App\Services\Documents\DocumentRenderer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        DocumentCatalog::ensureForBarangay($user->barangay_id);
        $labels = DocumentCatalog::fields();

        $templates = DocumentTemplate::query()
            ->where('barangay_id', $user->barangay_id)
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'resident_fields'])
            ->map(fn (DocumentTemplate $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'fields' => collect($template->resident_fields ?? [])
                    ->map(fn (string $key) => [
                        'key' => $key,
                        'label' => $labels[$key] ?? $key,
                    ])
                    ->values(),
            ]);

        $requests = DocumentRequestModel::query()
            ->where('user_id', $user->id)
            ->with('template:id,name')
            ->latest()
            ->get()
            ->map(fn (DocumentRequestModel $item) => [
                'id' => $item->id,
                'document_name' => $item->template?->name ?? 'Document',
                'status' => $item->status,
                'submitted_at' => $item->created_at?->format('M j, Y'),
                'review_note' => $item->review_note,
            ]);

        return Inertia::render('Resident/Documents/Index', [
            'templates' => $templates,
            'requests' => $requests,
        ]);
    }

    public function store(Request $request, DocumentTemplate $template): RedirectResponse
    {
        $this->availableTemplate($request, $template);
        $rules = [];
        foreach ($template->resident_fields ?? [] as $field) {
            if (array_key_exists($field, DocumentCatalog::fields())) {
                $rules['answers.'.$field] = ['required', 'string', 'max:255'];
            }
        }

        $data = $request->validate($rules);
        $answers = collect($data['answers'] ?? [])
            ->only($template->resident_fields ?? [])
            ->map(fn ($value) => trim((string) $value))
            ->all();

        $record = DocumentRequestModel::query()->create([
            'barangay_id' => $request->user()->barangay_id,
            'template_id' => $template->id,
            'user_id' => $request->user()->id,
            'status' => 'submitted',
            'answers' => $answers,
        ]);

        return redirect()
            ->route('documents.show', $record)
            ->with('success', 'Request sent to the barangay.');
    }

    public function show(Request $request, DocumentRequestModel $documentRequest, DocumentRenderer $renderer): Response
    {
        if ($documentRequest->user_id !== $request->user()->id) {
            abort(404);
        }

        $documentRequest->load(['template', 'resident.residentProfile', 'resident.barangay']);
        $released = in_array($documentRequest->status, ['ready', 'released'], true);

        return Inertia::render('Resident/Documents/Show', [
            'requestItem' => [
                'id' => $documentRequest->id,
                'document_name' => $documentRequest->template->name,
                'status' => $documentRequest->status,
                'review_note' => $documentRequest->review_note,
                'submitted_at' => $documentRequest->created_at?->format('F j, Y'),
                'certificate' => $released ? $renderer->renderRequest($documentRequest) : null,
                'signatory_name' => $documentRequest->template->signatory_name,
                'signatory_title' => $documentRequest->template->signatory_title,
                'paper_size' => $documentRequest->template->paper_size ?: 'short',
                'signature_url' => $documentRequest->resident->barangay?->signature_path
                    ? asset('storage/'.$documentRequest->resident->barangay->signature_path)
                    : null,
                ...$renderer->letterhead($documentRequest->resident->barangay),
                ...$renderer->issuedParts($documentRequest->reviewed_at ?? $documentRequest->created_at),
            ],
        ]);
    }

    private function availableTemplate(Request $request, DocumentTemplate $template): void
    {
        if ($template->barangay_id !== $request->user()->barangay_id || ! $template->is_enabled) {
            abort(404);
        }
    }
}
