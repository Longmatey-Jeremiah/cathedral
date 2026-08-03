import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { GenerateDto } from './dto/generate.dto';
import { AiGenerateResultDto, AiHealthDto } from './dto/ai.response.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // Open: liveness probe, no inference.
  @Get('health')
  @ApiOkResponse({ type: AiHealthDto })
  async health() {
    return { ok: true, models: await this.ai.models() };
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: AiGenerateResultDto })
  async generate(@Body() dto: GenerateDto) {
    return { response: await this.ai.generate(dto.prompt, dto.model) };
  }

  /**
   * Chat turn streamed as plain text chunks.
   *
   * ponytail: raw text, not SSE — the browser reads it with a fetch()
   * ReadableStream, so there is no event framing to invent or parse. Move to
   * SSE only if a client needs named events or auto-reconnect.
   */
  @Post('stream')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiProduces('text/plain')
  async stream(@Body() dto: ChatDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no'); // don't let nginx buffer the stream

    try {
      for await (const chunk of this.ai.stream(dto.messages, dto.model)) {
        res.write(chunk);
      }
    } catch (err) {
      // Nothing sent yet → let the exception filter render a normal error body.
      if (!res.headersSent) throw err;
      // Mid-stream: the status line is long gone, so the marker is the only
      // channel left. The client surfaces whatever follows it.
      res.write(`\n\n[stream-error] ${(err as Error).message}`);
    }
    res.end();
  }
}
