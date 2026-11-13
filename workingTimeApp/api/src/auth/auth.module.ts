import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWT_SECRET, JwtStrategy } from './jwt.strategy';
import { EmployeeModule } from '../employees/employee.module';

@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        expiresIn: "10h",
      },
      secret: JWT_SECRET,
    }),
    EmployeeModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
  ],
})
export class AuthModule { }
