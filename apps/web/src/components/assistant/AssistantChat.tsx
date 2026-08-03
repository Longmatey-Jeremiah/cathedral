'use client';

import { useEffect, useRef, useState } from 'react';
import { FiArrowUp, FiSquare, FiTrash2 } from 'react-icons/fi';
import { streamChat, type ChatMessage } from '@/services/ai.service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/shared/lib/cn';

const SUGGESTIONS = [
  'Draft a follow-up message for first-time visitors.',
  'What should a monthly giving report cover for our board?',
  'Suggest a check-in cadence for department leaders.',
];

export function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest text in view while it streams in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  // Abandon an in-flight reply if the user navigates away.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || streaming) return;

    const history: ChatMessage[] = [
      ...messages,
      { role: 'user', content: prompt },
    ];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat(
        history,
        (chunk) =>
          setMessages((current) =>
            current.map((message, i) =>
              i === current.length - 1
                ? { ...message, content: message.content + chunk }
                : message,
            ),
          ),
        controller.signal,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      // Drop the empty placeholder so a failed turn leaves no blank bubble.
      setMessages((current) =>
        current.filter((m, i) => i !== current.length - 1 || m.content !== ''),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  return (
    <div className="flex h-[calc(100vh-16rem)] min-h-[420px] flex-col rounded-[var(--radius-cards)] border border-border bg-card shadow-card">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
            <p className="font-display text-[20px] text-carbon">
              Ask about anything in the workspace
            </p>
            <p className="mt-2 text-[13px] text-stone">
              Claude has no access to your records, so it drafts and advises —
              it never quotes figures.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-full border border-border px-4 py-2 text-[13px] text-stone transition-colors hover:bg-muted hover:text-carbon"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.map((message, i) => (
              <Message key={i} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mx-auto max-w-3xl">
          {error ? (
            <p role="alert" className="mb-2 text-[13px] text-destructive">
              {error}
            </p>
          ) : null}

          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends; Shift+Enter is a newline.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask a question, or describe what you need drafted…"
              rows={2}
              className="max-h-40 min-h-[56px] resize-none"
              aria-label="Message"
            />
            {streaming ? (
              <Button type="button" size="icon" variant="outline" onClick={stop}>
                <FiSquare size={14} aria-hidden />
                <span className="sr-only">Stop</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                onClick={() => void send(input)}
                disabled={!input.trim()}
              >
                <FiArrowUp size={16} aria-hidden />
                <span className="sr-only">Send</span>
              </Button>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p aria-live="polite" className="text-[12px] text-stone">
              {streaming ? 'Replying…' : 'Enter to send · Shift+Enter for a new line'}
            </p>
            {messages.length > 0 && !streaming ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
              >
                <FiTrash2 size={13} aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          // ponytail: plain text, not markdown. Add a renderer when a reply
          // actually needs tables or headings to be readable.
          'max-w-[85%] whitespace-pre-wrap rounded-[14px] px-4 py-3 text-[14px] leading-[1.6]',
          // foreground/background rather than carbon/white — the pair inverts
          // correctly under the dark palette.
          isUser
            ? 'bg-foreground text-background'
            : 'border border-border bg-muted/40 text-carbon',
        )}
      >
        {message.content || <span className="text-stone">Thinking…</span>}
      </div>
    </div>
  );
}
