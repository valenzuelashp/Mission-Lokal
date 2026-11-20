<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Services\BarangayHelpAssistant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BarangayChatController extends Controller
{
    private const HISTORY_TTL_SECONDS = 1800;

    private const MAX_MESSAGES = 12;

    public function index(Request $request)
    {
        if ($request->expectsJson()) {
            return response()->json(['messages' => $this->history($request), 'csrfToken' => csrf_token()]);
        }

        return Inertia::render('Resident/BarangayHelp', [
            'messages' => $this->history($request),
            'csrfToken' => csrf_token(),
        ]);
    }

    public function ask(Request $request, BarangayHelpAssistant $assistant)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:1000'],
            'request_id' => ['nullable', 'uuid'],
            'retry' => ['sometimes', 'boolean'],
        ]);
        $question = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', ' ', $validated['question']) ?? '');
        if ($question === '') {
            throw ValidationException::withMessages(['question' => 'Please enter a question.']);
        }
        $requestId = $validated['request_id'] ?? (string) Str::uuid();
        $history = $this->history($request);
        foreach ($history as $message) {
            if ($message['role'] === 'assistant' && ($message['request_id'] ?? null) === $requestId) {
                return $this->respond($request, $history, $message);
            }
        }
        $lastIndex = count($history) - 1;
        if (($validated['retry'] ?? false) && $lastIndex >= 1
            && $history[$lastIndex]['role'] === 'assistant' && $history[$lastIndex]['status'] !== 'answered'
            && $history[$lastIndex - 1]['content'] === $question) {
            $history = array_slice($history, 0, -2);
        }

        $reply = $assistant->answer((string) $request->user()->barangay_id, $question, $history, $requestId);
        $message = [
            'id' => (string) Str::uuid(), 'request_id' => $requestId, 'role' => 'assistant',
            'content' => $reply['answer'], 'basis' => $reply['basis'], 'sources' => $reply['sources'],
            'status' => $reply['status'], 'notice' => $reply['notice'],
        ];
        $history[] = ['id' => (string) Str::uuid(), 'role' => 'user', 'content' => $question];
        $history[] = $message;
        $history = array_slice($history, -self::MAX_MESSAGES);
        $request->session()->put($this->historyKey($request), [
            'updated_at' => now()->timestamp, 'messages' => $history,
        ]);

        return $this->respond($request, $history, $message);
    }

    public function clear(Request $request)
    {
        $request->session()->forget($this->historyKey($request));

        return response()->json(['messages' => []]);
    }

    private function respond(Request $request, array $history, array $message)
    {
        if ($request->expectsJson()) {
            return response()->json(['messages' => $history, 'reply' => $message], $message['status'] === 'unavailable' ? 503 : 200);
        }

        return Inertia::render('Resident/BarangayHelp', ['messages' => $history, 'csrfToken' => csrf_token()]);
    }

    private function history(Request $request): array
    {
        $key = $this->historyKey($request);
        $conversation = $request->session()->get($key, []);
        if (($conversation['updated_at'] ?? 0) < now()->timestamp - self::HISTORY_TTL_SECONDS) {
            $request->session()->forget($key);

            return [];
        }

        return array_slice($conversation['messages'] ?? [], -self::MAX_MESSAGES);
    }

    private function historyKey(Request $request): string
    {
        return 'barangay_help.'.hash('sha256', $request->user()->id.'|'.$request->user()->barangay_id);
    }
}
