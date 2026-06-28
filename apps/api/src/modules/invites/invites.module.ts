import { Module, forwardRef } from '@nestjs/common';
import { ChurchesModule } from '../churches/churches.module';
import { UsersModule } from '../users/users.module';
import { InvitesController } from './invites.controller';
import { InvitesRepository } from './invites.repository';
import { InvitesService } from './invites.service';

@Module({
  imports: [UsersModule, forwardRef(() => ChurchesModule)],
  controllers: [InvitesController],
  providers: [InvitesService, InvitesRepository],
  exports: [InvitesService],
})
export class InvitesModule {}
