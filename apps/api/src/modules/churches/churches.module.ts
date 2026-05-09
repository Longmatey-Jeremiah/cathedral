import { Module } from '@nestjs/common';
import { ChurchesController } from './churches.controller';
import { ChurchesRepository } from './churches.repository';
import { ChurchesService } from './churches.service';

@Module({
  controllers: [ChurchesController],
  providers: [ChurchesService, ChurchesRepository],
  exports: [ChurchesService, ChurchesRepository],
})
export class ChurchesModule {}
