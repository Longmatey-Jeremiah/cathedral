import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';
import { ServiceTypesController } from './service-types.controller';

@Module({
  imports: [UsersModule],
  controllers: [AttendanceController, ServiceTypesController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
