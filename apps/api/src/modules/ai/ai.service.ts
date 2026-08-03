import Anthropic from '@anthropic-ai/sdk';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const DEFAULT_MODEL = 'claude-opus-5';

const SYSTEM_PROMPT = `You assist staff of a church running the Cathedral platform: membership, attendance, giving, departments, pastoral care, and the reports built from them.

Answer plainly and concisely — lead with the answer, keep caveats short. You have no access to this church's records, so never invent figures, names, or dates: when a number would be needed, say what the user should pull from the relevant module and leave a clearly marked placeholder.`;

// Thin wrapper over the Anthropic SDK.
// ponytail: prompt→text and messages→stream. Later features reuse them:
//   - classify → output_config.format with a json_schema
//   - RAG      → prepend retrieved records as a user turn before the question
@Injectable()
export class AiService {
  private readonly client = new Anthropic(); // reads ANTHROPIC_API_KEY

  constructor(private readonly config: ConfigService) {}

  private get model(): string {
    return this.config.get<string>('ANTHROPIC_MODEL') ?? DEFAULT_MODEL;
  }

  private rethrow(err: unknown): never {
    if (err instanceof Anthropic.APIConnectionError) {
      throw new HttpException(
        'Anthropic is unreachable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    if (err instanceof Anthropic.APIError) {
      throw new HttpException(
        `Anthropic error (${err.status}): ${err.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    throw err;
  }

  private async guard<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      this.rethrow(err);
    }
  }

  /** Liveness: returns the model ids the API key can reach. */
  async models(): Promise<string[]> {
    const page = await this.guard(() => this.client.models.list({ limit: 20 }));
    return page.data.map((m) => m.id);
  }

  /**
   * Conversation → text chunks as they arrive.
   *
   * Thinking is on but not displayed, so only text deltas are yielded — the
   * caller sees nothing until the model starts writing its answer.
   */
  async *stream(
    messages: { role: 'user' | 'assistant'; content: string }[],
    model?: string,
  ): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: model ?? this.model,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages,
    });

    try {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield event.delta.text;
        }
      }
    } catch (err) {
      this.rethrow(err);
    }
  }

  /** Single prompt → completion. Non-streaming. */
  async generate(prompt: string, model?: string): Promise<string> {
    const message = await this.guard(() =>
      this.client.messages.create({
        model: model ?? this.model,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    );
    // Content may lead with a thinking block — never index [0] blindly.
    return message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
  }
}
