import { Injectable, Logger } from '@nestjs/common';
import { STATUS_BY_BREAKS, attendanceParamEnum } from '../types/dtos/employee.schema';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/errors/app-errors';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import * as argon2 from "argon2";

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }
  private readonly logger = new Logger(EmployeeService.name);
  // 従業員取得
  async findById(
    id: string,
  ) {
    if (!id) {
      throw new ApiException('VALIDATION_FAILED', 'IDが存在しません');
    }
    const employee = await this.prismaService.employee.findUnique({
      where: { id: id },
    });
    if (employee) {
      return employee;
    } else {
      throw new ApiException('EMPLOYEE_NOT_FOUND');
    }
  }

  // 従業員取得(ログインID)
  async findByLoginId(
    loginId: string,
  ) {
    if (!loginId || loginId.length === 0) {
      throw new ApiException('VALIDATION_FAILED', 'ログインIDが存在しません');
    }

    // 従業員テーブルに接続して取得する処理
    const employee = await this.prismaService.employee.findUnique({
      where: { loginId: loginId },
      select: {
        id: true,
        name: true,
        loginPasswordHash: true,
        isActive: true,
        role: {
          select: {
            id: true,
          }
        }
      },
    });

    return employee;
  }

  // 最新の打刻記録を確認
  private findFirstAttendance(id: string) {
    return this.prismaService.attendance.findFirst({
      where: {
        employeeId: id,
        workOutTime: null,
      },
      include: {
        breaks: {
          where: { breakOutTime: null },
        },
      },
    });
  }

  // 現在の打刻状態を取得する関数
  private async findCurrentAttendance(id: string) {
    const openAttendance = await this.findFirstAttendance(id);
    if (openAttendance !== null) {
      return {
        openAttendance,
        currentAttendance: STATUS_BY_BREAKS[openAttendance.breaks.length]
      };
    }
    const finishedAttendance = await this.prismaService.attendance.findFirst({
      where: {
        employeeId: id,
        workDate: new Date(dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')),
        workOutTime: { not: null },
      },
    });
    return {
      openAttendance,
      currentAttendance: finishedAttendance ? 'finished' : 'work_out',
    };
  }

  // 現在の打刻状態を取得
  async getCurrentAttendance(
    id: string,
  ) {
    const employee = await this.findById(id);
    if (!employee) {
      throw new ApiException('EMPLOYEE_NOT_FOUND');
    }
    const { currentAttendance } = await this.findCurrentAttendance(id);
    return { currentAttendance };
  }

  // 打刻
  async attendance(
    id: string,
    attendanceParam: string,
  ) {
    const employee = await this.findById(id);
    if (!employee) {
      throw new ApiException('EMPLOYEE_NOT_FOUND');
    }
    // 今の状態を調べる
    const { openAttendance, currentAttendance } = await this.findCurrentAttendance(id);
    const todayNow = new Date();
    // 打刻パラメータによる分岐実行
    switch (attendanceParam) {
      case "work_in":
        if (currentAttendance !== "work_out") {
          throw new ApiException('INVALID_ATTENDANCE_STATE');
        }
        const workIn = await this.prismaService.attendance.create({
          data: {
            employeeId: id,
            workDate: new Date(dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD')),
            workInTime: todayNow,
          }
        });
        return {
          attendanceId: workIn.id,
          attendanceParam: attendanceParam,
          recordedAt: todayNow,
        };
      case "break_in":
        if (currentAttendance !== "work_in") {
          throw new ApiException('INVALID_ATTENDANCE_STATE');
        }
        if (openAttendance !== null) {
          const breakIn = await this.prismaService.break.create({
            data: {
              attendanceId: openAttendance.id,
              breakInTime: todayNow,
            },
          });
          return {
            attendanceId: breakIn.id,
            attendanceParam: attendanceParam,
            recordedAt: todayNow,
          };
        } else {
          throw new ApiException('VALIDATION_FAILED', `不正な打刻パラメータです：${attendanceParam}`);
        }
      case "break_out":
        if (currentAttendance !== "break_in") {
          throw new ApiException('INVALID_ATTENDANCE_STATE');
        }
        if (openAttendance !== null) {
          const breakOut = await this.prismaService.break.update({
            where: { id: openAttendance.breaks[0].id },
            data: {
              breakOutTime: todayNow,
            },
          });
          return {
            attendanceId: breakOut.id,
            attendanceParam: attendanceParam,
            recordedAt: todayNow,
          };
        } else {
          throw new ApiException('VALIDATION_FAILED', `不正な打刻パラメータです：${attendanceParam}`);
        }
      case "work_out":
        if (currentAttendance !== "work_in") {
          throw new ApiException('INVALID_ATTENDANCE_STATE');
        }
        if (openAttendance !== null) {
          // 退勤に更新した後、月別勤務一覧から実働時間・休憩時間・時間外労働時間を追加する
          // トランザクション開始(複数のテーブルを跨ぐため)
          const workOut = await this.prismaService.$transaction(async (tx) => {
            const workOutAttendance = await tx.attendance.update({
              where: { id: openAttendance.id },
              data: {
                workOutTime: todayNow,
              },
              include: {
                breaks: true,
              }
            });
            // 実働時間等の計算
            const dutySeconds = Math.floor((todayNow.getTime() - workOutAttendance.workInTime.getTime()) / 1000);
            const breakSeconds = workOutAttendance.breaks.reduce(
              (sum, breaks) =>
                sum + (breaks.breakInTime && breaks.breakOutTime ?
                  Math.floor((breaks.breakOutTime.getTime() - breaks.breakInTime.getTime()) / 1000)
                  : 0),
              0,
            );
            const workSeconds = dutySeconds - breakSeconds;
            const overSeconds = Math.max(0, workSeconds - 28800);

            // 月別勤務一覧更新
            const workMonth = dayjs.utc(workOutAttendance.workDate).format('YYYY-MM');
            await tx.employeeMonthlyIndex.upsert({
              where: {
                employeeId_workMonth: {
                  employeeId: id,
                  workMonth: workMonth,
                }
              },
              create: {
                employeeId: id,
                employeeName: employee.name,
                workMonth: workMonth,
                workInCount: 1,
                workOutCount: 1,
                workMonthlyTime: workSeconds,
                breakMonthlyTime: breakSeconds,
                overTime: overSeconds,
              },
              update: {
                workInCount: { increment: 1 },
                workOutCount: { increment: 1 },
                workMonthlyTime: { increment: workSeconds },
                breakMonthlyTime: { increment: breakSeconds },
                overTime: { increment: overSeconds },
              }
            });
            return workOutAttendance;
          });

          return {
            attendanceId: workOut.id,
            attendanceParam: attendanceParam,
            recordedAt: todayNow,
          };
        } else {
          throw new ApiException('VALIDATION_FAILED', `不正な打刻パラメータです：${attendanceParam}`);
        }
    }
  }

  // 従業員作成
  async createEmployee(
    loginId: string,
    loginName: string,
    loginPassword: string,
    role: number,
  ) {
    const passwordHash = await argon2.hash(loginPassword);
    const employee = await this.prismaService.employee.create({
      data: {
        loginId: loginId,
        name: loginName,
        loginPasswordHash: passwordHash,
        isActive: true,
        role: {
          connect: { id: role },
        }
      }
    });

    return {
      employeeId: employee.id,
      loginId: employee.loginId,
      name: employee.name,
      isActive: employee.isActive,
    };
  }

  // 従業員無効化
  async deactivateEmployee(
    loginId: string,
  ) {
    const tempEmployee = await this.findByLoginId(loginId);
    if (!tempEmployee) {
      throw new ApiException('EMPLOYEE_NOT_FOUND');
    }
    if (!tempEmployee.isActive) {
      throw new ApiException("EMPLOYEE_ALREADY_INACTIVE");
    }

    const employee = await this.prismaService.employee.update({
      where: { loginId: loginId },
      data: {
        isActive: false,
      },
    });
    return {
      employeeId: employee.id,
      isActive: employee.isActive,
    };
  }

  // 月別従業員勤務一覧取得
  async getMonthlyWorklogs(
    yearMonth?: string,
    employeeId?: string,
  ) {
    const worklogs = await this.prismaService.employeeMonthlyIndex.findMany({
      where: {
        workMonth: yearMonth,
        employeeId: employeeId,
      },
      orderBy: [
        {
          workMonth: 'desc'
        },
        {
          employeeName: 'asc',
        },
      ]
    });
    return worklogs.map((w) => ({
      id: w.employeeId,
      employeeName: w.employeeName,
      workYearMonth: w.workMonth,
      workInCount: w.workInCount,
      workOutCount: w.workOutCount,
      workingTime: w.workMonthlyTime,
      breakingTime: w.breakMonthlyTime,
      overWorkingTime: w.overTime,
    }));
  }
}
