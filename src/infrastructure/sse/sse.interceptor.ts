import type { Request, Response } from 'express';

import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type MessageEvent,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NEVER, type Observable, type Subscription } from 'rxjs';

import { isSseStream } from './sse-stream.decorator';

@Injectable()
export class SseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SseInterceptor.name);

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    if (!isSseStream(this.reflector, context)) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    this.logger.log(`Setting up SSE stream for request: ${req.originalUrl}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate, max-age=0, no-transform'
    );
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream$ = next.handle() as Observable<MessageEvent>;
    let subscription: null | Subscription = null;

    subscription = stream$.subscribe({
      complete: () => {
        this.logger.log('SSE stream Observable completed. Ending response.');
        if (!res.writableEnded) {
          res.end();
        }
      },
      error: (err) => {
        this.logger.error(
          `SSE stream Observable errored: ${err.message}`,
          err.stack
        );
        if (!res.writableEnded) {
          res.end();
        }
      },
      next: (messageEvent) => {
        if (res.writableEnded) {
          this.logger.warn(
            'Attempted to write to an already ended SSE stream. Unsubscribing.'
          );
          subscription?.unsubscribe();
          return;
        }
        try {
          let formattedMessage = '';
          if (messageEvent.id) {
            formattedMessage += `id: ${messageEvent.id}\n`;
          }
          if (messageEvent.type) {
            formattedMessage += `event: ${messageEvent.type}\n`;
          }

          let dataString: string;
          const eventData = messageEvent.data;

          if (typeof eventData === 'string') {
            dataString = eventData;
          } else if (typeof eventData === 'object' && eventData !== null) {
            try {
              dataString = JSON.stringify(eventData);
            } catch (stringifyError) {
              this.logger.error(
                `Failed to JSON.stringify SSE data: ${stringifyError.message}`,
                stringifyError.stack
              );
              dataString = `{"error": "Failed to stringify data on server"}`;
            }
          } else {
            dataString = String(eventData);
          }

          const dataLines = dataString.split(/\r?\n/);
          formattedMessage += dataLines
            .map((line) => `data: ${line}`)
            .join('\n');
          formattedMessage += '\n\n';

          res.write(formattedMessage);
        } catch (error) {
          this.logger.error(
            `Error writing SSE message: ${error.message}`,
            error.stack
          );
          if (!res.writableEnded) {
            res.end();
          }
          subscription?.unsubscribe();
        }
      },
    });

    req.on('close', () => {
      this.logger.log(
        `Client disconnected for request: ${req.originalUrl}. Cleaning up SSE subscription.`
      );
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
      if (!res.writableEnded) {
        res.end();
      }
    });

    try {
      res.write(
        `event: connection_ready\ndata: {"message": "SSE connection established"}\n\n`
      );
    } catch (error) {
      this.logger.error(
        `Error writing initial SSE connection event: ${error.message}`,
        error.stack
      );
      if (!res.writableEnded) {
        res.end();
      }
      subscription?.unsubscribe();
    }

    return NEVER;
  }
}
