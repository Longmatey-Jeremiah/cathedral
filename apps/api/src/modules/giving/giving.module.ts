import { Module } from '@nestjs/common';
import { GivingController } from './giving.controller';
import { GivingRepository } from './giving.repository';
import { GivingService } from './giving.service';

@Module({
  controllers: [GivingController],
  providers: [GivingService, GivingRepository],
  exports: [GivingService, GivingRepository],
})
export class GivingModule {}
