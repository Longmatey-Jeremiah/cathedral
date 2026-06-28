import { Module, forwardRef } from '@nestjs/common';
import { InvitesModule } from '../invites/invites.module';
import { ChurchesController } from './churches.controller';
import { ChurchesRepository } from './churches.repository';
import { ChurchesService } from './churches.service';

@Module({
  imports: [forwardRef(() => InvitesModule)],
  controllers: [ChurchesController],
  providers: [ChurchesService, ChurchesRepository],
  exports: [ChurchesService, ChurchesRepository],
})
export class ChurchesModule {}
