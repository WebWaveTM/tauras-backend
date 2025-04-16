import { Expose } from 'class-transformer';

import type { Tokens } from '../const';

export class TokensDto implements Tokens {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  constructor(payload: Partial<Tokens>) {
    Object.assign(this, payload);
  }
}
