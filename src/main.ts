import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      colors: true,
      logLevels: ['debug', 'verbose'],
      timestamp: true,
    }),
  });

  app.enableCors();
  app.use(helmet());

  const config = app.get<AppConfigService>(AppConfigService);
  const port = config.get('APP_PORT');

  await app.listen(port);
}
bootstrap();
