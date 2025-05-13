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
  const config = app.get<AppConfigService>(AppConfigService);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useLogger(logger);
  app.set('query parser', 'extended');
  app.enableCors({
    credentials: true,
    origin: config.get('CORS_ORIGIN'),
  });
  app.use(helmet());
  app.use(cookieParser());

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  const port = config.get('APP_PORT');
  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}`);
}
bootstrap();
