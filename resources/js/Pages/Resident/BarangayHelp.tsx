import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AlertCircle, BookOpen, Bot, CheckCheck, Globe2, LoaderCircle, MessageCircle, RotateCcw, Send, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import ResidentLayout, { useResidentTheme } from '@/Layouts/ResidentLayout';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { cn } from '@/Lib/utils';
import { HelpRequestError, requestHelp, trustedSourceUrl, type AnswerBasis, type HelpMessage } from '@/Lib/barangayHelp';

interface Props {
    messages?: HelpMessage[];
    csrfToken: string;
}

const basisLabels: Record<AnswerBasis, string> = {
    barangay: 'Barangay records',
    general: 'General guidance',
    mixed: 'Records + general guidance',
    clarification: 'Let’s clarify',
    restricted: 'Privacy protected',
};

const suggestions = [
    'What can I request online?',
    'Paano mag-report ng problema sa barangay?',
    'Who can I call in an emergency?',
];
const emptyMessages: HelpMessage[] = [];

export default function BarangayHelp({ messages: initialMessages = emptyMessages, csrfToken }: Props) {
    const theme = useResidentTheme();
    const [messages, setMessages] = useState(initialMessages);
    const [token, setToken] = useState(csrfToken);
    const [question, setQuestion] = useState('');
    const [processing, setProcessing] = useState(false);
    const [pendingQuestion, setPendingQuestion] = useState('');
    const [error, setError] = useState<HelpRequestError | Error | null>(null);
    const [retryQuestion, setRetryQuestion] = useState('');
    const busy = useRef(false);
    const mounted = useRef(true);
    const revision = useRef(0);
    const activeRequest = useRef<AbortController | null>(null);
    const pendingAttempt = useRef<{ question: string; id?: string } | null>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => setMessages(initialMessages), [initialMessages]);
    useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages, processing]);
    useEffect(() => {
        mounted.current = true;
        const sync = new AbortController();
        const initialRevision = revision.current;
        // Browser Back can restore cached page props. The session remains the source of truth.
        requestHelp('GET', {}, csrfToken, sync.signal).then((result) => {
            if (!mounted.current || revision.current !== initialRevision) return;
            setMessages(result.messages);
            if (result.csrfToken) setToken(result.csrfToken);
        }).catch((caught) => {
            if (!mounted.current || sync.signal.aborted || revision.current !== initialRevision) return;
            if (caught instanceof HelpRequestError && caught.code === 'session') setMessages([]);
            setError(caught instanceof HelpRequestError ? caught : new Error('The saved conversation could not be refreshed. Please retry or reload this page.'));
        });
        return () => {
            mounted.current = false;
            sync.abort();
            activeRequest.current?.abort();
        };
    }, []);

    const send = async (text: string, retry = false) => {
        const trimmed = text.trim();
        if (!trimmed || busy.current) return;
        revision.current++;
        busy.current = true;
        setProcessing(true);
        setPendingQuestion(trimmed);
        setRetryQuestion(trimmed);
        setError(null);
        const attempt = pendingAttempt.current?.question === trimmed
            ? pendingAttempt.current
            : { question: trimmed, id: globalThis.crypto?.randomUUID?.() };
        pendingAttempt.current = attempt;
        const controller = new AbortController();
        activeRequest.current = controller;
        const timeout = window.setTimeout(() => controller.abort(), 35000);

        try {
            const result = await requestHelp('POST', { question: trimmed, request_id: attempt.id, retry }, token, controller.signal);
            if (!mounted.current) return;
            setMessages(result.messages);
            setQuestion(result.reply?.status === 'unavailable' ? trimmed : '');
            pendingAttempt.current = null;
        } catch (caught) {
            setQuestion(trimmed);
            setError(caught instanceof HelpRequestError
                ? caught
                : new Error('The connection was interrupted or took too long. Your question is still here; please retry.'));
        } finally {
            window.clearTimeout(timeout);
            busy.current = false;
            setProcessing(false);
            setPendingQuestion('');
            activeRequest.current = null;
        }
    };

    const clear = async () => {
        if (busy.current) return;
        revision.current++;
        busy.current = true;
        setProcessing(true);
        setError(null);
        const controller = new AbortController();
        activeRequest.current = controller;
        const timeout = window.setTimeout(() => controller.abort(), 15000);
        try {
            const result = await requestHelp('DELETE', {}, token, controller.signal);
            if (!mounted.current) return;
            setMessages(result.messages);
            setRetryQuestion('');
            pendingAttempt.current = null;
            inputRef.current?.focus();
        } catch (caught) {
            setError(caught instanceof HelpRequestError ? caught : new Error('The conversation could not be cleared. Please retry.'));
            setRetryQuestion('');
        } finally {
            window.clearTimeout(timeout);
            busy.current = false;
            setProcessing(false);
            activeRequest.current = null;
        }
    };

    const sessionError = error instanceof HelpRequestError && error.code === 'session';

    return (
        <ResidentLayout wide>
            <Head title="Barangay AI Help" />
            <div className="w-full max-w-3xl mx-auto space-y-5 pb-4 pt-8 sm:pt-10">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className={cn('text-xs font-black uppercase tracking-wider', theme.primaryText)}>Mission-Lokal RAG Assistant</p>
                        <h1 className={cn('mt-1 text-2xl sm:text-3xl font-black tracking-tight', theme.textMain)}>Barangay Knowledge Assistant</h1>
                        <p className={cn('mt-1.5 text-xs sm:text-sm font-medium leading-relaxed', theme.textMuted)}>
                            Ask naturally in English, Filipino, or Taglish. You can ask follow-up questions, too.
                        </p>
                    </div>
                    {messages.length > 0 && (
                        <Button type="button" variant="ghost" size="icon" onClick={clear} disabled={processing} aria-label="Clear conversation" title="Clear conversation" className={cn('shrink-0 rounded-xl', theme.textMuted)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className={cn('flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium shadow-2xs', theme.badgeBorder, theme.badgeBg, theme.textMain)}>
                    <ShieldCheck className={cn('mt-0.5 h-5 w-5 shrink-0', theme.primaryText)} />
                    <div className="space-y-1.5 leading-relaxed">
                        <p>Barangay records take priority. General guidance is labeled and may need local confirmation.</p>
                        <p>This assistant cannot access private resident records or confidential blotters. Avoid sharing passwords or sensitive personal details.</p>
                        <Link href="/library" className={cn('inline-flex items-center gap-1.5 font-bold underline underline-offset-2', theme.primaryText)}>
                            <BookOpen className="h-3.5 w-3.5" /> Published contacts and emergency information
                        </Link>
                    </div>
                </div>

                <div role="log" aria-label="Conversation with Barangay Assistant" aria-live="polite" aria-relevant="additions text" className="space-y-4">
                    {messages.length === 0 && !pendingQuestion && (
                        <div className={cn('rounded-3xl border p-6 sm:p-8 shadow-sm', theme.cardBorder, theme.cardBg)}>
                            <MessageCircle className={cn('h-7 w-7 mb-3', theme.primaryText)} />
                            <h2 className={cn('text-base font-black', theme.textMain)}>How can I help?</h2>
                            <p className={cn('mt-2 text-sm leading-relaxed', theme.textMuted)}>Ask about services, documents, community concerns, or published contacts. If a local detail is missing, I’ll explain what is known and how to check it.</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {suggestions.map((suggestion) => (
                                    <button key={suggestion} type="button" disabled={processing} onClick={() => { setQuestion(suggestion); inputRef.current?.focus(); }} className={cn('rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors', theme.badgeBorder, theme.badgeBg, theme.textMain, theme.hoverBg)}>
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => {
                        const isUser = message.role === 'user';
                        const basis = message.basis ?? 'general';
                        const BasisIcon = basis === 'barangay' ? CheckCheck : basis === 'mixed' ? BookOpen : basis === 'general' ? Globe2 : MessageCircle;
                        const previousQuestion = messages[index - 1]?.role === 'user' ? messages[index - 1].content : '';
                        return (
                            <article key={message.id} aria-label={isUser ? 'Your question' : 'Assistant response'} className={cn('rounded-3xl border p-5 sm:p-6 shadow-sm space-y-3 break-words', theme.cardBorder, isUser ? theme.badgeBg : theme.cardBg, isUser && 'sm:ml-12')}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className={cn('flex items-center gap-2 text-xs font-black uppercase tracking-wider', theme.textMain)}>
                                        {isUser ? <UserRound className="h-4 w-4" /> : <Bot className={cn('h-5 w-5', theme.primaryText)} />}
                                        {isUser ? 'You' : 'Barangay Assistant'}
                                    </div>
                                    {!isUser && (
                                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold', theme.badgeBorder, theme.badgeBg, theme.textMain)}>
                                            <BasisIcon className="h-3 w-3" /> {basisLabels[basis]}
                                        </span>
                                    )}
                                </div>
                                {message.notice && (
                                    <p className={cn('flex items-start gap-2 rounded-xl border p-3 text-xs font-medium leading-relaxed', theme.badgeBorder, theme.badgeBg, theme.textMain)}>
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {message.notice}
                                    </p>
                                )}
                                <p className={cn('whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-medium', theme.textMain)}>{message.content}</p>
                                {!!message.sources?.length && (
                                    <div className={cn('border-t pt-3 space-y-2', theme.dividerColor)}>
                                        <p className={cn('text-[10px] font-black uppercase tracking-wider', theme.textMuted)}>Published sources</p>
                                        {message.sources.map((source) => (
                                            <div key={source.id} className="text-xs">
                                                {trustedSourceUrl(source.url) ? <a href={source.url} className={cn('font-bold underline underline-offset-2', theme.primaryText)}>{source.title}</a> : <span className={theme.textMain}>{source.title}</span>}
                                                {source.updated_at && <span className={cn('block mt-0.5 text-[10px]', theme.textMuted)}>Record updated {new Date(source.updated_at).toLocaleDateString('en-PH')}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isUser && index === messages.length - 1 && message.status !== 'answered' && previousQuestion && (
                                    <button type="button" disabled={processing} onClick={() => send(previousQuestion, true)} className={cn('inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-2', theme.primaryText)}>
                                        <RotateCcw className="h-3.5 w-3.5" /> Retry this question
                                    </button>
                                )}
                            </article>
                        );
                    })}
                    {pendingQuestion && <p className={cn('rounded-2xl border p-4 text-sm whitespace-pre-wrap sm:ml-12', theme.badgeBorder, theme.badgeBg, theme.textMain)}>{pendingQuestion}</p>}
                    {processing && <p role="status" className={cn('flex items-center gap-2 px-2 text-xs font-medium', theme.textMuted)}><LoaderCircle className="h-4 w-4 animate-spin" /> {pendingQuestion ? 'Checking sources and preparing an answer…' : 'Clearing conversation…'}</p>}
                    <div ref={endRef} />
                </div>

                {error && (
                    <div role="alert" className={cn('rounded-2xl border p-4 space-y-3', theme.badgeBorder, theme.badgeBg, theme.textMain)}>
                        <p className="flex items-start gap-2 text-xs font-medium leading-relaxed"><AlertCircle className="h-4 w-4 shrink-0" /> {error.message}</p>
                        <div className="flex flex-wrap gap-4 text-xs font-bold">
                            {sessionError ? <a href="/login" className="underline underline-offset-2">Sign in again</a> : retryQuestion && <button type="button" disabled={processing} onClick={() => send(retryQuestion, true)} className="underline underline-offset-2">Retry question</button>}
                            <a href="/help" className="underline underline-offset-2">Reload Barangay Help</a>
                            <Link href="/library" className="underline underline-offset-2">Resource Library</Link>
                        </div>
                    </div>
                )}

                <form onSubmit={(event) => { event.preventDefault(); send(question); }} className={cn('space-y-3 rounded-3xl border p-5 sm:p-6 shadow-sm', theme.cardBorder, theme.cardBg)}>
                    <label htmlFor="question" className={cn('text-xs font-black uppercase tracking-wider block', theme.textMain)}>Your question</label>
                    <Textarea ref={inputRef} id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Halimbawa: Paano po kumuha ng barangay clearance?" maxLength={1000} required disabled={processing} aria-describedby="question-help" className={cn('resize-none rounded-2xl p-4 text-sm', theme.inputBg)} rows={3} />
                    <div className="flex items-center justify-between gap-3">
                        <p id="question-help" className={cn('text-[10px] sm:text-xs font-medium', theme.textMuted)}>Conversation expires after 30 minutes of inactivity.</p>
                        <Button type="submit" disabled={processing || !question.trim()} className={cn('shrink-0 text-white font-black text-xs px-5 rounded-2xl h-11', theme.primaryBg, theme.primaryHover)}>
                            <Send className="mr-2 h-4 w-4" /> {processing ? 'Please wait…' : 'Send'}
                        </Button>
                    </div>
                </form>
            </div>
        </ResidentLayout>
    );
}
