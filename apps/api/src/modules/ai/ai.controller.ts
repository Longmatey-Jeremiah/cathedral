import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // Open: liveness probe, no model load.
  @Get('health')
  async health() {
    const { models } = await this.ai.tags();
    return { ok: true, models: models.map((m) => m.name) };
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Body() dto: GenerateDto) {
    return { response: await this.ai.generate(dto.prompt, dto.model) };
  }
}
