import { z } from 'zod';

// 打刻用パラメータ
type currentAttendance = 'work_in' | 'work_out' | 'break_in' | 'finished';
export const STATUS_BY_BREAKS: Partial<Record<number, currentAttendance>> = {
  0: 'work_in',
  1: 'break_in',
};

export const attendanceParamEnum = ["work_in", "work_out", "break_in", "break_out"];

export const attendanceSchema = z.object({
  attendanceParam: z.enum(attendanceParamEnum, { error: '打刻パラメータは必須です' })
}, { error: 'リクエストボディが不正です' });
export type AttendanceRequest = z.infer<typeof attendanceSchema>;

export const createEmployeeSchema = z.object({
  loginId: z
    .string({ error: 'ログインIDは必須です' })
    .min(1, 'ログインIDは必須です')
    .max(50, 'ログインIDは50文字以内です'),
  loginName: z
    .string({ error: '従業員名は必須です' })
    .min(1, '従業員名は必須です')
    .max(50, '従業員名は50文字以内です'),
  loginPassword: z
    .string({ error: 'パスワードは必須です' })
    .min(1, 'パスワードは必須です'),
  role: z
    .number({ error: '権限は必須です' }),
}, { error: 'リクエストボディが不正です' });

export type createEmployeeRequest = z.infer<typeof createEmployeeSchema>;

export const deactivateEmployeeSchema = z.object({
  loginId: z
    .string({ error: 'ログインIDは必須です' })
    .min(1, 'ログインIDは必須です')
    .max(50, 'ログインIDは50文字以内です'),
}, { error: 'リクエストボディが不正です' });
export type deactivateEmployeeRequest = z.infer<typeof deactivateEmployeeSchema>;

export const monthlyWorklogsSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, '年月は YYYY-MM 形式です').optional(),
  employeeId: z.uuid({ error: '従業員IDの形式が不正です' }).optional(),
});
export type MonthlyWorklogsQuery = z.infer<typeof monthlyWorklogsSchema>;