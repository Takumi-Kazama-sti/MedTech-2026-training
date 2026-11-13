import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ApiExceptionsFilter } from './common/filters/exceptions.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });
  await app.useLogger(app.get(Logger));
  app.useGlobalFilters(new ApiExceptionsFilter());
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
