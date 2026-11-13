import { HttpException } from '@nestjs/common';
import { z } from 'zod';

// エラーカタログ：アプリで返すエラーはすべてここに定義する
export const APP_ERRORS = {
  VALIDATION_FAILED: { status: 400, code: 'ERR-001', message: '入力内容が不正です' },
  AUTH_FAILED: { status: 401, code: 'ERR-002', message: '認証に失敗しました' },
  FORBIDDEN: { status: 403, code: 'ERR-003', message: '権限がありません' },
  EMPLOYEE_NOT_FOUND: { status: 404, code: 'ERR-004', message: '対象の従業員は存在しません' },
  ROUTE_NOT_FOUND: { status: 404, code: 'ERR-005', message: '指定されたURLは存在しません' },
  EMPLOYEE_ALREADY_INACTIVE: { status: 409, code: 'ERR-006', message: '対象の従業員は既に無効です' },
  INVALID_ATTENDANCE_STATE: { status: 409, code: 'ERR-007', message: '現在の状態ではこの打刻はできません' },
  INTERNAL: { status: 500, code: 'ERR-500', message: 'サーバーエラーが発生しました' },
} as const;

export type AppErrorKey = keyof typeof APP_ERRORS;
type ErrorCode = (typeof APP_ERRORS)[AppErrorKey]['code'];

const ERROR_CODES = Object.values(APP_ERRORS).map((error) => error.code) as [ErrorCode, ...ErrorCode[]];
export const errorResponseSchema = z.object({
  code: z.enum(ERROR_CODES),
  message: z.string(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export class ApiException extends HttpException {
  constructor(key: AppErrorKey, message?: string) {
    const error = APP_ERRORS[key];
    super({ code: error.code, message: message ?? error.message }, error.status);
  }
}
