import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AppErrorKey, ApiException } from '../errors/app-errors';

const ERROR_KEY_BY_STATUS: Partial<Record<number, AppErrorKey>> = {
  400: 'VALIDATION_FAILED',
  401: 'AUTH_FAILED',
  403: 'FORBIDDEN',
  404: 'ROUTE_NOT_FOUND',
};

// すべての例外を { code, message } の形にそろえて返す
@Catch()
export class ApiExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const appException = this.toApiException(exception);
    response.status(appException.getStatus()).json(appException.getResponse());
  }

  // どんな例外も ApiException に変換する
  private toApiException(exception: unknown): ApiException {
    if (exception instanceof ApiException) {
      return exception;
    }

    const key = exception instanceof HttpException
      ? ERROR_KEY_BY_STATUS[exception.getStatus()]
      : undefined;
    if (!key) {
      // 想定外のエラー：中身はログにだけ出し、利用者には汎用メッセージを返す
      this.logger.error(exception);
      return new ApiException('INTERNAL');
    }
    return new ApiException(key);
  }
}
