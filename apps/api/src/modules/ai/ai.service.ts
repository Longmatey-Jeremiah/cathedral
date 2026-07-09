import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Thin client over the local Ollama HTTP API. Native fetch, no SDK.
// ponytail: plain generate/tags only. Later features reuse generate():
//   - RAG chat  → POST /api/chat with a messages[] array
//   - classify  → pass options.format = 'json'
//   - content   → already the plain prompt→text path below
@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config.get<string>('OLLAMA_URL') ?? 'http://localhost:11434';
  }

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, init);
    } catch {
      throw new HttpException('Ollama is unreachable', HttpStatus.SERVICE_UNAVAILABLE);
    }
    if (!res.ok) {
      throw new HttpException(
        `Ollama error (${res.status})`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    return res.json() as Promise<T>;
  }

  /** Liveness: returns the models Ollama has pulled. */
  async tags(): Promise<{ models: { name: string }[] }> {
    return this.call('/api/tags');
  }

  /** Single prompt → completion. Non-streaming. */
  async generate(prompt: string, model?: string): Promise<string> {
    const chosen = model ?? this.config.get<string>('OLLAMA_MODEL') ?? 'llama3.2';
    const data = await this.call<{ response: string }>('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: chosen, prompt, stream: false }),
    });
    return data.response;
  }
}
