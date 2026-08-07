import { NotificationChannel } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  /** Cleared with an explicit empty string; omit to leave unchanged. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  notifyVia?: NotificationChannel;
}
