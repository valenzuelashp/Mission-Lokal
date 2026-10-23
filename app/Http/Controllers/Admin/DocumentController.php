<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequest as DocumentRequestModel;
use App\Models\DocumentTemplate;
use App\Services\Documents\DocumentCatalog;
use App\Services\Documents\DocumentRenderer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;
        DocumentCatalog::ensureForBarangay($barangayId);

        $templates = DocumentTemplate::query()
            ->where('barangay_id', $barangayId)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (DocumentTemplate $template) => $this->templatePayload($template));

        $requests = DocumentRequestModel::query()
            ->where('barangay_id', $barangayId)
            ->with(['template:id,name', 'resident:id,first_name,last_name,account_id'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (DocumentRequestModel $item) => [
                'id' => $item->id,
                'document_name' => $item->template?->name ?? 'Document',
                'resident_name' => trim(($item->resident->first_name ?? '').' '.($item->resident->last_name ?? '')) ?: $item->resident->account_id,
                'status' => $item->status,
                'submitted_at' => $item->created_at?->format('M j, Y g:i A'),
            ]);

        $barangay = $request->user()->barangay;

        return Inertia::render('Admin/Documents/Index', [
            'templates' => $templates,
            'requests' => $requests,
            'canModify' => $request->user()->canModifySystem(),
            'signatureUrl' => $this->signatureUrl($barangay?->signature_path),
        ]);
    }

    public function create(Request $request, DocumentRenderer $renderer): Response
    {
        $barangay = $request->user()->barangay;

        return Inertia::render('Admin/Documents/Form', [
            'template' => null,
            'fields' => $this->fieldOptions(),
            'letterhead' => $renderer->letterhead($barangay),
            'signatureUrl' => $this->signatureUrl($barangay?->signature_path),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify document templates.');
        }

        $data = $this->validatedTemplate($request);
        $key = Str::slug($data['name']);
        if ($key === '') {
            $key = 'document';
        }
        if (DocumentTemplate::query()->where('barangay_id', $request->user()->barangay_id)->where('key', $key)->exists()) {
            $key .= '-'.Str::lower(Str::random(4));
        }

        $sort = (int) DocumentTemplate::query()->where('barangay_id', $request->user()->barangay_id)->max('sort_order');

        DocumentTemplate::query()->create([
            'barangay_id' => $request->user()->barangay_id,
            'key' => $key,
            'name' => $data['name'],
            'body' => $data['body'],
            'signatory_name' => $data['signatory_name'],
            'signatory_title' => $data['signatory_title'],
            'resident_fields' => $data['resident_fields'] ?? [],
            'paper_size' => $data['paper_size'],
            'is_enabled' => $data['is_enabled'],
            'is_system' => false,
            'sort_order' => $sort + 1,
        ]);

        return redirect()->route('admin.documents.index')->with('success', 'Document template added.');
    }

    public function edit(Request $request, DocumentTemplate $template, DocumentRenderer $renderer): Response
    {
        $this->authorizeTemplate($request, $template);
        $barangay = $request->user()->barangay;

        return Inertia::render('Admin/Documents/Form', [
            'template' => $this->templatePayload($template),
            'fields' => $this->fieldOptions(),
            'letterhead' => $renderer->letterhead($barangay),
            'signatureUrl' => $this->signatureUrl($barangay?->signature_path),
        ]);
    }

    public function update(Request $request, DocumentTemplate $template): RedirectResponse
    {
        $this->authorizeTemplate($request, $template);
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify document templates.');
        }

        $data = $this->validatedTemplate($request);
        $template->update([
            'name' => $data['name'],
            'body' => $data['body'],
            'signatory_name' => $data['signatory_name'],
            'signatory_title' => $data['signatory_title'],
            'resident_fields' => $data['resident_fields'] ?? [],
            'paper_size' => $data['paper_size'],
            'is_enabled' => $data['is_enabled'],
        ]);

        return redirect()->route('admin.documents.index')->with('success', 'Document template saved.');
    }

    public function destroy(Request $request, DocumentTemplate $template): RedirectResponse
    {
        $this->authorizeTemplate($request, $template);
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify document templates.');
        }
        if ($template->is_system) {
            return back()->with('error', 'Built-in certificates stay in the list. Turn one off instead of deleting it.');
        }
        if ($template->requests()->exists()) {
            return back()->with('error', 'This document already has requests. Turn it off instead of deleting it.');
        }

        $template->delete();

        return back()->with('success', 'Custom document removed.');
    }

    public function show(Request $request, DocumentRequestModel $documentRequest, DocumentRenderer $renderer): Response
    {
        $documentRequest->load(['template', 'resident.residentProfile', 'resident.barangay']);
        if ($documentRequest->barangay_id !== $request->user()->barangay_id) {
            abort(404);
        }

        return Inertia::render('Admin/Documents/Show', [
            'requestItem' => [
                'id' => $documentRequest->id,
                'document_name' => $documentRequest->template->name,
                'resident_name' => trim($documentRequest->resident->first_name.' '.$documentRequest->resident->last_name),
                'account_id' => $documentRequest->resident->account_id,
                'status' => $documentRequest->status,
                'answers' => $this->labeledAnswers($documentRequest->answers ?? []),
                'review_note' => $documentRequest->review_note,
                'submitted_at' => $documentRequest->created_at?->format('F j, Y g:i A'),
                'certificate' => $renderer->renderRequest($documentRequest),
                'signatory_name' => $documentRequest->template->signatory_name,
                'signatory_title' => $documentRequest->template->signatory_title,
                'paper_size' => $documentRequest->template->paper_size ?: 'short',
                'signature_url' => $this->signatureUrl($documentRequest->resident->barangay?->signature_path),
                ...$renderer->letterhead($documentRequest->resident->barangay),
                ...$renderer->issuedParts($documentRequest->reviewed_at ?? $documentRequest->created_at),
            ],
            'canModify' => $request->user()->canModifySystem(),
        ]);
    }

    public function updateStatus(Request $request, DocumentRequestModel $documentRequest): RedirectResponse
    {
        if ($documentRequest->barangay_id !== $request->user()->barangay_id) {
            abort(404);
        }
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot update document requests.');
        }

        $data = $request->validate([
            'status' => ['required', Rule::in(['ready', 'released', 'rejected'])],
            'review_note' => ['nullable', 'string', 'max:1000', 'required_if:status,rejected'],
        ]);

        $documentRequest->update([
            'status' => $data['status'],
            'review_note' => $data['review_note'] ?? $documentRequest->review_note,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $message = match ($data['status']) {
            'ready' => 'Marked ready for pickup.',
            'released' => 'Marked as released to the resident.',
            default => 'Request was not issued.',
        };

        return back()->with('success', $message);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedTemplate(Request $request): array
    {
        $allowed = array_keys(DocumentCatalog::fields());

        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:5000'],
            'signatory_name' => ['nullable', 'string', 'max:120'],
            'signatory_title' => ['required', 'string', 'max:120'],
            'paper_size' => ['required', Rule::in(['show', 'short', 'long', 'a4'])],
            'resident_fields' => ['array'],
            'resident_fields.*' => [Rule::in($allowed)],
            'is_enabled' => ['required', 'boolean'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function templatePayload(DocumentTemplate $template): array
    {
        return [
            'id' => $template->id,
            'key' => $template->key,
            'name' => $template->name,
            'body' => $template->body,
            'signatory_name' => $template->signatory_name ?? '',
            'signatory_title' => $template->signatory_title,
            'paper_size' => $template->paper_size ?: 'short',
            'resident_fields' => $template->resident_fields ?? [],
            'is_enabled' => $template->is_enabled,
            'is_system' => $template->is_system,
        ];
    }

    /**
     * @return list<array{key: string, label: string}>
     */
    private function fieldOptions(): array
    {
        return collect(DocumentCatalog::fields())
            ->map(fn (string $label, string $key) => ['key' => $key, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $answers
     * @return list<array{label: string, value: string}>
     */
    private function labeledAnswers(array $answers): array
    {
        $labels = DocumentCatalog::fields();

        return collect($answers)
            ->map(fn ($value, $key) => [
                'label' => $labels[$key] ?? (string) $key,
                'value' => (string) $value,
            ])
            ->values()
            ->all();
    }

    public function storeSignature(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot change the barangay signature.');
        }

        $request->validate([
            'signature' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $barangay = $request->user()->barangay;
        if ($barangay->signature_path) {
            Storage::disk('public')->delete($barangay->signature_path);
        }

        $path = $request->file('signature')->store('barangay-signatures', 'public');
        $barangay->update(['signature_path' => $path]);

        return back()->with('success', 'Barangay signature saved.');
    }

    private function signatureUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return asset('storage/'.$path);
    }

    private function authorizeTemplate(Request $request, DocumentTemplate $template): void
    {
        if ($template->barangay_id !== $request->user()->barangay_id) {
            abort(404);
        }
    }
}
