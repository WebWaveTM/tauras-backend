import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigSchema } from './config.schema';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<ConfigSchema>) {}

  get<K extends keyof ConfigSchema>(key: K): ConfigSchema[K] {
    return this.configService.get<ConfigSchema>(key, { infer: true });
  }
}
