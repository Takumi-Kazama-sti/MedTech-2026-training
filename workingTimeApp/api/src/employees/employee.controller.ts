import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from './employee.service';
import { attendanceSchema, type AttendanceRequest } from '../types/dtos/employee.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import { type AuthUser } from '../auth/jwt.strategy';
import { ApiException } from '../common/errors/app-errors';

// 従業員メニュー
@Controller('employees')
@UseGuards(AuthGuard("jwt"))
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
  ) { }

  // 打刻
  @Post(':id/attendance')
  async attendance(
    @Param('id')
    id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(attendanceSchema))
    body: AttendanceRequest
  ) {
    // ログインした従業員以外の打刻は禁止
    if (id !== user.employeeId) {
      throw new ApiException('FORBIDDEN');
    }
    const attendaceInfo = await this.employeeService.attendance(id, body.attendanceParam);
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