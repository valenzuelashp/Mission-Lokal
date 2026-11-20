<?php

namespace App\Services;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

class BarangayHelpAssistant
{
    public function __construct(
        private BarangayHelpKnowledge $knowledge,
        private BarangayHelpAnswer $answers,
        private BarangayHelpGemini $gemini,
    ) {}

    public function answer(string $barangayId, string $question, array $history, string $requestId): array
    {
        if ($reply = $this->answers->restricted($question)) {
            return $reply;
        }
        $normalized = $this->knowledge->normalize($question);
        if (in_array($normalized, ['hi', 'hello', 'hey', 'help', 'help me', 'tulong', 'kamusta', 'kumusta', 'good morning', 'good afternoon', 'good evening', 'paano po', 'can you help me'], true)) {
            return $this->answers->reply($this->knowledge->isFilipino($question)
                ? 'Kumusta! Anong barangay service, dokumento, o community concern ang maitutulong ko sa inyo?'
                : 'Hello! Which barangay service, document, or community concern can I help you with?', 'clarification');
        }
        if (in_array($normalized, ['thanks', 'thank you', 'salamat', 'salamat po'], true)) {
            return $this->answers->reply($this->knowledge->isFilipino($question) ? 'Walang anuman! May iba pa ba kayong tanong?' : 'You are welcome! Is there anything else I can help you with?', 'clarification');
        }

        $retrievalQuestion = $this->contextualQuestion($question, $history);
        try {
            $retrieved = $this->knowledge->retrieve($barangayId, $retrievalQuestion);
        } catch (QueryException|\PDOException $exception) {
            Log::error('Barangay help published records could not be retrieved.', [
                'request_id' => $requestId, 'exception_class' => get_class($exception),
            ]);
            $reply = $this->answers->isEmergency($question)
                ? $this->answers->direct($question, [], [])
                : $this->answers->fallback($retrievalQuestion, false);

            return $this->limited($reply, 'records', $question);
        }
        $sources = $retrieved['sources'];
        $directQuestion = $this->answers->isEmergency($question) ? $question : $retrievalQuestion;
        if ($direct = $this->answers->direct($directQuestion, $sources, $retrieved['contacts'], $retrieved['documents'])) {
            return $direct;
        }

        // A carefully qualified common-hours example also works without the AI provider.
        if ($sources === [] && $this->knowledge->isOfficeHours($retrievalQuestion)) {
            return $this->answers->fallback($retrievalQuestion, true);
        }

        $topic = str_contains($retrievalQuestion, "\nCurrent topic: ") ? explode("\nCurrent topic: ", $retrievalQuestion, 2)[1] : null;
        $generated = $this->gemini->generate($question, $this->publicHistory($history), $sources, $requestId, $topic);
        if ($generated['error'] === null) {
            $reply = $this->answers->generated($generated['data'], $sources, $question);
            if ($reply !== null) {
                return $reply;
            }
            Log::warning('Barangay help AI evidence or guidance could not be verified.', ['request_id' => $requestId]);
        }

        return $this->limited(
            $this->answers->fallback($retrievalQuestion, true, $sources),
            $generated['error'] ?? 'invalid_response',
            $question,
        );
    }

    private function contextualQuestion(string $question, array $history): string
    {
        if ($this->isFollowUp($question)) {
            foreach (array_reverse($history) as $message) {
                if ($message['role'] === 'user' && ! $this->isFollowUp($message['content'])) {
                    return $question."\nCurrent topic: ".$message['content'];
                }
            }
        }

        return $question;
    }

    private function isFollowUp(string $question): bool
    {
        $normalized = $this->knowledge->normalize($question);

        return (bool) (preg_match('/^(and|what about|how about|at |paano naman|pano naman|eh |magkano naman)|\b(it|its|that|those|them|nito|niyan|iyan|iyon|yun|ito|doon|diyan|dito)\b/', $normalized)
            || preg_match('/^(how much|how long|magkano|gaano katagal)(?: po| naman)?$/', $normalized));
    }

    private function publicHistory(array $history): array
    {
        $safe = [];
        for ($index = 0; $index < count($history); $index += 2) {
            if (($history[$index + 1]['basis'] ?? '') !== 'restricted') {
                array_push($safe, ...array_slice($history, $index, 2));
            }
        }

        return $safe;
    }

    private function limited(array $reply, string $reason, string $question): array
    {
        $filipino = $this->knowledge->isFilipino($question);
        $reply['status'] = $reply['sources'] !== [] || $this->knowledge->facet($question) !== null ? 'degraded' : 'unavailable';
        $reply['notice'] = $filipino
            ? match ($reason) {
                'records' => 'Pansamantalang hindi ma-access ang barangay records. Pangkalahatang gabay lamang ang maibibigay sa ngayon.',
                'rate_limit' => 'Maraming gumagamit ng AI sa ngayon. Subukan muli pagkaraan ng ilang sandali.',
                'configuration' => 'Hindi pa handa ang AI service. Available pa rin ang mga naaangkop na published records at pangkalahatang gabay.',
                'incomplete' => 'Hindi natapos ang AI response. Ipinapakita ang ligtas na gabay sa ibaba; maaari mong subukan muli.',
                'safety', 'empty_or_blocked' => 'Hindi nakagawa ng ligtas at kumpletong sagot ang AI. Subukang linawin ang tanong.',
                'invalid_response' => 'Hindi ma-verify ang AI response. Ipinapakita lamang ang available na records o pangkalahatang gabay.',
                default => 'Hindi makonekta o makatugon ang AI service sa ngayon. Maaari mong subukan muli.',
            }
        : match ($reason) {
            'records' => 'Published barangay records are temporarily unreachable. Any guidance below is general.',
            'rate_limit' => 'The AI is busy right now. Please retry in a little while.',
            'configuration' => 'The AI service is not configured. Available published records and limited general guidance still work.',
            'incomplete' => 'The AI response was incomplete. Safe guidance is shown below; you can retry.',
            'safety', 'empty_or_blocked' => 'The AI could not produce a safe, complete answer. Try clarifying your question.',
            'invalid_response' => 'The AI response could not be verified. Only available records or general guidance are shown.',
            default => 'The AI service could not connect or respond right now. You can retry.',
        };

        return $reply;
    }
}
