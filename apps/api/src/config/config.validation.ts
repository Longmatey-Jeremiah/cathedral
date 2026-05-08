import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(16, { message: 'JWT_SECRET must be at least 16 characters' })
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1h';

  @IsInt()
  @IsOptional()
  INVITE_TOKEN_TTL_HOURS: number = 72;

  @IsString()
  @IsOptional()
  APP_URL: string = 'http://localhost:3000';

  @IsString()
  @IsOptional()
  MAIL_FROM?: string;
}

export function configValidationSchema(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.toString()).join('\n'));
  }
  return validated;
}
