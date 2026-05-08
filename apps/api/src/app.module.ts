import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { configValidationSchema } from './config/config.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChurchesModule } from './modules/churches/churches.module';
import { UsersModule } from './modules/users/users.module';
import { InvitesModule } from './modules/invites/invites.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidationSchema,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    ChurchesModule,
    UsersModule,
    InvitesModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
