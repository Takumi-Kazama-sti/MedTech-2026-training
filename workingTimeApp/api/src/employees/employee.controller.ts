import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/jwt.strategy';
import { ApiException } from '../common/errors/app-errors';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  type AttendanceRequest,
  attendanceSchema,
} from '../types/dtos/employee.schema';
import { EmployeeService } from './employee.service';

// 従業員メニュー
@Controller('employees')
@UseGuards(AuthGuard('jwt'))
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // 打刻
  @Post(':id/attendance')
  async attendance(
    @Param('id')
    id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(attendanceSchema))
    body: AttendanceRequest,
  ) {
    // ログインした従業員以外の打刻は禁止
    if (id !== user.employeeId) {
      throw new ApiException('FORBIDDEN');
    }
    const attendaceInfo = await this.employeeService.attendance(
      id,
      body.attendanceParam,
    );
    return attendaceInfo;
  }

  // 従業員の現在の打刻状態を取得
  @Get(':id/attendance/status')
  async attendanceStatus(
    @Param('id')
    id: string,
    @CurrentUser() user: AuthUser,
  ) {
    if (id !== user.employeeId) {
      throw new ApiException('FORBIDDEN');
    }
    return this.employeeService.getCurrentAttendance(id);
  }
}
