import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EmployeeService } from '../employees/employee.service';
import { ApiException } from '../common/errors/app-errors';

export const JWT_SECRET = 'dev-secret-key';

export interface JwtPayload {
  employeeId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  employeeId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly employeeService: EmployeeService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.token ?? null]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const employee = await this.employeeService.findById(payload.employeeId);
    if (!employee || !employee.isActive) {
      throw new ApiException('AUTH_FAILED');
    }
    return {
      employeeId: payload.employeeId,
      role: payload.role.toString(),
    }
  }
}