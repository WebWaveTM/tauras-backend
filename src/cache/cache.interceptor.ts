import type { Request } from 'express';

import { type Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, of, switchMap, tap } from 'rxjs';

import { getIsCacheDisabled } from './disable-cache.decorator';

const MUTABLE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const isMutableMethod = (method: string) => MUTABLE_METHODS.includes(method);

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector
  ) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    if (getIsCacheDisabled(context, this.reflector)) {
      return next.handle();
    }

    const httpHost = context.switchToHttp();
    const req = httpHost.getRequest<Request>();
    const path = req.path;

    return from(this.cacheManager.get(path)).pipe(
      switchMap((json) => {
        const isCachedGetReq = json && req.method === 'GET';
        const isCachedMutableReq = json && isMutableMethod(req.method);

        if (isCachedGetReq) {
          return of(json);
        }

        if (isCachedMutableReq) {
          return from(this.cacheManager.del(path)).pipe(
            switchMap(() =>
              next.handle().pipe(
                tap(async (response) => {
                  if (req.method === 'GET') {
                    await this.cacheManager.set(path, response);
                  }
                })
              )
            )
          );
        }

        return next.handle().pipe(
          tap(async (response) => {
            if (req.method === 'GET') {
              await this.cacheManager.set(path, response);
            }
          })
        );
      })
    );
  }
}
