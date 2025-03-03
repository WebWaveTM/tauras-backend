import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConfigSchema } from './config.schema';
import { AppConfigService } from './config.service';

@Global()
@Module({
  exports: [AppConfigService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      validate: (config) => ConfigSchema.parse(config),
    }),
  ],
  providers: [AppConfigService],
})
export class AppConfigModule {}
