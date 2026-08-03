import { Module } from '@nestjs/common';
import { CareController } from './care.controller';
import { CareRepository } from './care.repository';
import { CareService } from './care.service';

@Module({
  controllers: [CareController],
  providers: [CareService, CareRepository],
  exports: [CareService, CareRepository],
})
export class CareModule {}
