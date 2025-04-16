import type { User as TUser } from '@prisma/client';

import { Controller, type MessageEvent, Sse } from '@nestjs/common';
import { interval, map, type Observable } from 'rxjs';

import { User } from '~/modules/auth/decorators/user.decorator';

@Controller('sse')
export class SseController {
  @Sse('/subscribe')
  subscribe(@User() user: TUser): Observable<MessageEvent> {
    console.log(user);
    return interval(5000).pipe(
      map((_) => ({
        data: {
          foo: 'Hello world',
        },
      }))
    );
  }
}
