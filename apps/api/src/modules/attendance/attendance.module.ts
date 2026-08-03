import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';
import { ServiceTypesController } from './service-types.controller';

@Module({
  controllers: [AttendanceController, ServiceTypesController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
