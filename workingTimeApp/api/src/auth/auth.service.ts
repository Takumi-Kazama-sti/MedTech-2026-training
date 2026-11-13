import { Injectable } from '@nestjs/common';
import { Controller, Post, Get, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmployeeService } from '../employees/employee.service';
import { ApiException } from '../common/errors/app-errors';
import { LoginResponse } from '../types/dtos/auth.schema';
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly employeeService: EmployeeService,
  ) { }

  async login(
    loginId: string,
    loginPassword: string,
  ): Promise<LoginResponse> {
    // ログインIDからユーザー権限を取得
    const user = await this.employeeService.findByLoginId(loginId);
    if (!user || !user.isActive) {
      throw new ApiException('AUTH_FAILED', 'ログインIDまたはパスワードが不正です');
    }

    // verifyでargon2のパスワード照合
    const passwordHash = await argon2.verify(user.loginPasswordHash, loginPassword)
    if (!passwordHash) {
      throw new ApiException('AUTH_FAILED', 'ログインIDまたはパスワードが不正です');
    }

    const payload = { employeeId: user.id, role: user.role.id.toString() };
    return {
      responseToken: this.jwtService.sign(payload),
      employeeName: user.name,
      role: user.role.id.toString(),
    };
  }
}
