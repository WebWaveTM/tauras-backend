import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import { ClsModule } from 'nestjs-cls';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { PRISMA_SERVICE_INJECTION_TOKEN } from './infrastructure/database/prisma/prisma.service';
import { RedisModule } from './infrastructure/database/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccessTokenGuard } from './modules/auth/guards/access-token.guard';
import { DisciplineModule } from './modules/discipline/discipline.module';
import { SseModule } from './modules/sse/sse.module';
import { UserModule } from './modules/user/user.module';

@Module({
  controllers: [AppController],
  imports: [
    SseModule,
    AppConfigModule,
    PrismaModule,
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot([{ limit: 5, ttl: 1000 * 10 }]),
    TerminusModule,
    RedisModule,
    // DevtoolsModule.registerAsync({
    //   inject: [AppConfigService],
    //   useFactory: (configService: AppConfigService) => ({
    //     http: configService.get('NODE_ENV') !== 'production',
    //   }),
    // }),
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        pinoHttp: {
          genReqId: () => randomUUID(),
          level: configService.get('LOG_LEVEL'),
          transport: {
            targets: [
              {
                level: configService.get('LOG_LEVEL'),
                options: {
                  colorize: true,
                  ignore: 'pid,hostname,context,req,res',
                  translateTime: 'SYS:standard',
                },
                target: 'pino-pretty',
              },
              {
                level: configService.get('LOG_LEVEL'),
                options: {
                  extension: 'log',
                  file: join(__dirname, '..', 'logs', 'app'),
                  frequency: 'daily',
                  limit: {
                    count: 20,
                  },
                  mkdir: true,
                  size: '100M',
                },
                target: 'pino-roll',
              },
            ],
          },
        },
      }),
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
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
    ScheduleModule.forRoot(),
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
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
