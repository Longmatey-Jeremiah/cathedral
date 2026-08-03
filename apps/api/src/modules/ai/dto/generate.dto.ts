import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  prompt!: string;

  // Optional per-request model override; falls back to ANTHROPIC_MODEL env.
  @IsOptional()
  @IsString()
  @MaxLength(120)
  model?: string;
}
