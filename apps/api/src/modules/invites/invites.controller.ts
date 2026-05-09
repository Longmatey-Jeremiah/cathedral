import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { InviteUserDto } from './dto/invite-user.dto';
import { InvitesService } from './invites.service';

@Controller('users/invite')
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  invite(
    @Body() dto: InviteUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.invites.invite(dto, actor);
  }

  @Get('validate')
  @Public()
  validate(@Query('token') token: string) {
    return this.invites.validate(token);
  }
}
