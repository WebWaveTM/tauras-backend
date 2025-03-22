import type { NestExpressApplication } from '@nestjs/platform-express';

import { ConsoleLogger, Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      colors: true,
      logLevels: ['debug', 'verbose'],
      timestamp: true,
    }),
  });

  const logger = new Logger('bootstrap');

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.set('query parser', 'extended');
  app.enableCors();
  app.use(helmet());
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
