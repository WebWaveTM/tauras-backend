import { Global, Module } from '@nestjs/common';

import { AppConfigService } from '~/config/config.service';

import { IsUniqueFieldConstraint } from './decorators/is-unique-field.decorator';
import {
  BasePrismaService,
  PRISMA_SERVICE_INJECTION_TOKEN,
} from './prisma.service';

@Global()
@Module({
  exports: [PRISMA_SERVICE_INJECTION_TOKEN],
  providers: [
    {
      inject: [AppConfigService],
      provide: PRISMA_SERVICE_INJECTION_TOKEN,
      useFactory: (configService: AppConfigService) =>
        new BasePrismaService(configService).withExtensions(),
    },
    IsUniqueFieldConstraint,
  ],
})
export class PrismaModule {}
