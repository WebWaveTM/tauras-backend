import { Logger, mixin } from '@nestjs/common';
import { finalize, Observable, Subject } from 'rxjs';

import type { MessageEvent } from './types';

export function SseServiceFactory<
  D extends number | object | string,
  T extends string,
>(name: string) {
  const service = class SseService {
    readonly #clients = new Map<number, Set<Subject<MessageEvent<D, T>>>>();
    readonly #logger = new Logger(name);

    addClient(userId: number): Observable<MessageEvent<D, T>> {
      this.#logger.log(`Adding new client connection for user ID: ${userId}`);
      const newSubject = new Subject<MessageEvent<D, T>>();

      if (!this.#clients.has(userId)) {
        this.#clients.set(userId, new Set());
      }
      const userSubjects = this.#clients.get(userId)!;

      userSubjects.add(newSubject);
      this.#logger.debug(
        `User ${userId} now has ${userSubjects.size} connections.`
      );

      return newSubject.asObservable().pipe(
        finalize(() => {
          this.removeClient(userId, newSubject);
        })
      );
    }

    removeClient(
      userId: number,
      subjectToRemove: Subject<MessageEvent<D, T>>
    ): void {
      const userSubjects = this.#clients.get(userId);
      if (userSubjects) {
        subjectToRemove.complete();
        userSubjects.delete(subjectToRemove);
        this.#logger.log(`Removed a client connection for user ID: ${userId}.`);

        if (userSubjects.size === 0) {
          this.#clients.delete(userId);
          this.#logger.log(
            `All connections removed for user ID: ${userId}. User entry deleted.`
          );
        } else {
          this.#logger.debug(
            `User ${userId} has ${userSubjects.size} connections remaining.`
          );
        }
      } else {
        this.#logger.warn(
          `Attempted to remove client for user ID: ${userId}, but no entry found.`
        );
      }
    }

    removeUser(userId: number) {
      const userSubjects = this.#clients.get(userId);

      if (userSubjects) {
        userSubjects.forEach((s) => s.complete());
        this.#clients.delete(userId);
      } else {
        this.#logger.warn(
          `Attempted to remove all clients for user ID: ${userId}, but no entry found.`
        );
      }
    }

    sendMessage(userId: number, data: MessageEvent<D, T>): boolean {
      const userSubjects = this.#clients.get(userId);
      if (userSubjects && userSubjects.size > 0) {
        this.#logger.log(
          `Sending message to ${userSubjects.size} clients for user ID: ${userId}`
        );

        let sentCount = 0;
        userSubjects.forEach((subject) => {
          try {
            if (!subject.closed) {
              subject.next(data);
              sentCount++;
            } else {
              this.#logger.warn(
                `Attempted to send message to a closed subject for user ID: ${userId}. Removing stale connection.`
              );
              this.removeClient(userId, subject);
            }
          } catch (error) {
            this.#logger.error(
              `Error sending message to a client for user ID ${userId}: ${error.message}`,
              error.stack
            );
            this.removeClient(userId, subject);
          }
        });
        this.#logger.debug(
          `Message sent to ${sentCount} active clients for user ID: ${userId}`
        );
        return sentCount > 0;
      }
      this.#logger.warn(
        `Cannot send message: No active clients found for user ID: ${userId}`
      );
      return false;
    }

    broadcast(data: MessageEvent<D, T>): void {
      this.#logger.log(`Broadcasting message to all connected clients.`);
      let totalClients = 0;
      this.#clients.forEach((userSubjects, userId) => {
        userSubjects.forEach((subject) => {
          try {
            if (!subject.closed) {
              subject.next(data);
              totalClients++;
            } else {
              this.#logger.warn(
                `Found closed subject during broadcast for user ID: ${userId}. Removing stale connection.`
              );
              this.removeClient(userId, subject);
            }
          } catch (error) {
            this.#logger.error(
              `Error broadcasting to a client for user ID ${userId}: ${error.message}`,
              error.stack
            );
            this.removeClient(userId, subject);
          }
        });
      });
      this.#logger.log(
        `Broadcast message sent to ${totalClients} active clients.`
      );
    }
  };

  return mixin(service);
}
