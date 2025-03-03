import KeyvRedis from '@keyv/redis';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import Keyv from 'keyv';
import { ClsModule } from 'nestjs-cls';

import { AppController } from './app.controller';
import { CacheInterceptor } from './cache/cache.interceptor';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { PrismaModule } from './prisma/prisma.module';
import { PRISMA_SERVICE_INJECTION_TOKEN } from './prisma/prisma.service';

@Module({
  controllers: [AppController],
  imports: [
    AppConfigModule,
    PrismaModule,
    CacheModule.registerAsync({
      inject: [AppConfigService],
      isGlobal: true,
      useFactory: (configService: AppConfigService) => {
        const redisStore = new KeyvRedis(`${configService.get('REDIS_URL')}/0`);

        const l1Cache = new Keyv({ namespace: 'l1cache', ttl: 1000 * 20 });

        const l2Cache = new Keyv({
          namespace: 'l2cache',
          store: redisStore,
          ttl: 1000 * 60 * 1,
        });

        return {
          stores: [l1Cache, l2Cache],
          ttl: 1000 * 20,
        };
      },
    }),
    ThrottlerModule.forRoot([{ limit: 5, ttl: 1000 * 10 }]),
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
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
