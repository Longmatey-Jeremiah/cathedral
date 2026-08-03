import { ApiError } from '@/services/api';
import { store } from '@/store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Streams an assistant reply, calling `onChunk` with each piece of text.
 *
 * The endpoint returns plain chunked text rather than SSE, so this reads the
 * body directly — `api.ts` can't be reused here, it buffers and JSON-parses.
 * Pass `signal` from an AbortController to let the user stop a reply.
 */
export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = store.getState().auth.session?.accessToken;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/ai/stream`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });
  } catch {
    if (signal?.aborted) return;
    throw new ApiError(0, null, 'Could not reach the server.');
  }

  if (!response.ok || !response.body) {
    const text = await response.text();
    let payload: unknown = null;
    try {
      payload = JSON.parse(text);
    } catch {
      // Non-JSON error body — the raw text is the fallback message.
    }
    throw new ApiError(
      response.status,
      isApiErrorPayload(payload) ? payload : null,
      text.slice(0, 200) || `Request failed with ${response.status}`,
    );
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) onChunk(value);
    }
  } catch (err) {
    if (!signal?.aborted) throw err;
  } finally {
    reader.releaseLock();
  }
}

function isApiErrorPayload(
  value: unknown,
): value is { statusCode: number; message: string | string[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'message' in value
  );
}
