import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from './employee.service';
import {
  createEmployeeSchema, deactivateEmployeeSchema, monthlyWorklogsSchema,
  type createEmployeeRequest, type deactivateEmployeeRequest, type MonthlyWorklogsQuery
}
  from '../types/dtos/employee.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

// 管理者メニュー
@Controller('admin')
@UseGuards(AuthGuard("jwt"))
export class AdminEmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
  ) { }

  // 従業員登録
  @Post('employees/create')
  async createEmployee(
    @Body(new ZodValidationPipe(createEmployeeSchema))
    body: createEmployeeRequest
  ) {
    const employee = await this.employeeService.createEmployee(
      body.loginId,
      body.loginName,
      body.loginPassword,
      body.role,
    );
    return employee;
  }

  // 従業員無効化
  @Post('employees/deactivate')
  async deactivateEmployee(
    @Body(new ZodValidationPipe(deactivateEmployeeSchema))
    body: deactivateEmployeeRequest
  ) {
    const employee = await this.employeeService.deactivateEmployee(body.loginId);
    return employee;
  }

  // 月別従業員勤務一覧取得
  @Get('monthly-worklogs')
  async monthlyWorklogs(
    @Query(new ZodValidationPipe(monthlyWorklogsSchema))
    query: MonthlyWorklogsQuery
  ) {
    const workLogs = await this.employeeService.getMonthlyWorklogs(
      query.yearMonth,
      query.employeeId,
    );
    return workLogs;
  }
}