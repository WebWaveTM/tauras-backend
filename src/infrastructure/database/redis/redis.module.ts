import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

import { AppConfigService } from '~/config/config.service';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  exports: [REDIS_CLIENT],
  providers: [
    {
      inject: [AppConfigService],
      provide: REDIS_CLIENT,
      useFactory: (configService: AppConfigService) => {
        return new Redis({
          connectTimeout: 10000,
          db: 1,
          host: configService.get('REDIS_HOST'),
          password: configService.get('REDIS_PASSWORD'),
          port: configService.get('REDIS_PORT'),
          username: configService.get('REDIS_USER'),
        });
      },
    },
  ],
})
export class RedisModule {}
