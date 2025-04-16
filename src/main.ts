import type { NestExpressApplication } from '@nestjs/platform-express';

import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    snapshot: true,
  });

  const logger = app.get(Logger);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useLogger(logger);
  app.set('query parser', 'extended');
  app.enableCors();
  app.use(helmet());
  app.use(cookieParser());

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  const config = app.get<AppConfigService>(AppConfigService);
  const port = config.get('APP_PORT');
  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}`);
}
bootstrap();
