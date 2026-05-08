import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { ChurchesService } from './churches.service';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';

@Controller('churches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChurchesController {
  constructor(private readonly churches: ChurchesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateChurchDto) {
    return this.churches.create(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.churches.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.churches.findById(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChurchDto,
  ) {
    return this.churches.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.churches.remove(id);
  }
}
