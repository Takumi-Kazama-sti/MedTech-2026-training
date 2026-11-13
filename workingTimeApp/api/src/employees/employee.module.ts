import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminEmployeeController } from './admin-employee.controller';

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [
    EmployeeController,
    AdminEmployeeController
  ],
  providers: [
    EmployeeService,
  ],
  exports: [
    EmployeeService,
  ]
})
export class EmployeeModule { }
