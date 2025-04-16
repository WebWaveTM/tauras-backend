import type { MessageEvent } from '@nestjs/common';

import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private readonly clients = new Map<number, Subject<MessageEvent>>();
  private readonly logger = new Logger(SseService.name);

  // constructor(private readonly redisService: Red)

  addClient(userId: number): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    this.clients.set(userId, subject);
    this.logger.log(`Client added with user id: ${userId}`);
    return subject.asObservable();
  }

  removeClient(userId: number): void {
    if (this.clients.has(userId)) {
      this.clients.get(userId).complete();
      this.clients.delete(userId);
      this.logger.log(`Client removed with user id: ${userId}`);
    }
  }

  sendMessage(userId: number, data: any): boolean {
    const client = this.clients.get(userId);
    if (client) {
      client.next({ data });
      this.logger.log(`Message sent to user id: ${userId}`);
      return true;
    }
    this.logger.warn(`Client not found with user id: ${userId}`);
    return false;
  }
}
