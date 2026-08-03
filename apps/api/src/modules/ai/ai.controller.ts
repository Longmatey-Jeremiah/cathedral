import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateDto } from './dto/generate.dto';
import { AiGenerateResultDto, AiHealthDto } from './dto/ai.response.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // Open: liveness probe, no model load.
  @Get('health')
  @ApiOkResponse({ type: AiHealthDto })
  async health() {
    const { models } = await this.ai.tags();
    return { ok: true, models: models.map((m) => m.name) };
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: AiGenerateResultDto })
  async generate(@Body() dto: GenerateDto) {
    return { response: await this.ai.generate(dto.prompt, dto.model) };
  }
}
