import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

// ponytail: one check on the bit that actually breaks — content[0] is often a
// thinking block, not text. Everything else is SDK surface.
describe('AiService.generate', () => {
  it('extracts text and skips thinking blocks', async () => {
    const service = new AiService({ get: () => undefined } as unknown as ConfigService);
    const stub = service as unknown as { client: unknown };
    stub.client = {
      messages: {
        create: async () => ({
          content: [
            { type: 'thinking', thinking: '' },
            { type: 'text', text: 'Hello' },
            { type: 'text', text: ' world' },
          ],
        }),
      },
    };

    expect(await service.generate('hi')).toBe('Hello world');
  });
});
