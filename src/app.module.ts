import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { ClsModule } from 'nestjs-cls';
import { randomUUID } from 'node:crypto';

import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { DisciplineModule } from './discipline/discipline.module';
import { PrismaModule } from './prisma/prisma.module';
import { PRISMA_SERVICE_INJECTION_TOKEN } from './prisma/prisma.service';
import { UserModule } from './user/user.module';

@Module({
  controllers: [AppController],
  imports: [
    AppConfigModule,
    PrismaModule,
    UserModule,
    ThrottlerModule.forRoot([{ limit: 5, ttl: 1000 * 10 }]),
    TerminusModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        generateId: true,
        idGenerator: () => randomUUID(),
        mount: true,
      },
      plugins: [
        new ClsPluginTransactional({
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PRISMA_SERVICE_INJECTION_TOKEN,
          }),
          imports: [PrismaModule],
        }),
      ],
    }),
    DisciplineModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          skipMissingProperties: true,
          skipUndefinedProperties: true,
          transform: true,
          whitelist: true,
        }),
    },
    {
      inject: [Reflector],
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) =>
        new ClassSerializerInterceptor(reflector, {
          enableImplicitConversion: true,
          strategy: 'excludeAll',
        }),
    },
  ],
})
export class AppModule {}
