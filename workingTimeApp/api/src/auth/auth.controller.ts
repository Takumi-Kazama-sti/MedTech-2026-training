import { Controller, Post, Get, Body, Res, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginRequestSchema, type LoginRequest } from '../types/dtos/auth.schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './current-user.decorator';
import type { AuthUser } from './jwt.strategy';
import { EmployeeService } from '../employees/employee.service';
import { ApiException } from '../common/errors/app-errors';
import e from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly employeeService: EmployeeService,
  ) { }

  // ログイン処理
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema))
    body: LoginRequest,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const response = await this.authService.login(body.loginId, body.loginPassword);
    // cookieにHttpOnly, Secureを付与する
    res.cookie('token', response.responseToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 36000 * 1000,
    });
    return {
      employeeName: response.employeeName,
      role: response.role,
    };
  }

  // 従業員名・権限取得（画面遷移用）
  @UseGuards(AuthGuard('jwt'))
  @Get('employee')
  async getEmployee(
    @CurrentUser() user: AuthUser,
  ) {
    const employee = await this.employeeService.findById(user.employeeId);
    if (!employee) throw new ApiException('EMPLOYEE_NOT_FOUND');
    return {
      id: employee.id,
      employeeName: employee.name,
      role: employee.roleId,
    }
  }

  // ログアウト
  @Post('logout')
  @HttpCode(204)
  async logout(
    @Res({ passthrough: true })
    res: Response,
  ) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
  }
}