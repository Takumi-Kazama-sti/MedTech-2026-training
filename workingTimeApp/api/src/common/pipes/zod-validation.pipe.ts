import { PipeTransform } from '@nestjs/common';
import { z } from 'zod';
import { ApiException } from '../errors/app-errors';

export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) { }

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(' / ');
      throw new ApiException('VALIDATION_FAILED', message);
    }
    return result.data;
  }
}
