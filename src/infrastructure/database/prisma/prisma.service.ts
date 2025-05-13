import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient, type User } from '@prisma/client';
import bcrypt from 'bcrypt';

import { AppConfigService } from '~/config/config.service';

export type PrismaService = ReturnType<BasePrismaService['withExtensions']>;

export const PRISMA_SERVICE_INJECTION_TOKEN = 'PrismaService';

@Injectable()
export class BasePrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'error' | 'info' | 'query' | 'warn'
  >
  implements OnModuleDestroy, OnModuleInit
{
  private readonly logger = new Logger(PRISMA_SERVICE_INJECTION_TOKEN);

  constructor(private readonly configService: AppConfigService) {
    super({
      log:
        configService.get('NODE_ENV') === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'info' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : [
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ],
    });

    this.$on('query', (e) => {
      this.logger.debug(`Query: ${e.query} ${e.params}`);
    });

    this.$on('info', (e) => {
      this.logger.log(e.message);
    });

    this.$on('warn', (e) => {
      this.logger.warn(e.message);
    });

    this.$on('error', (e) => {
      this.logger.error(e.message);
    });
  }

  onModuleDestroy() {
    this.$disconnect();
  }

  onModuleInit() {
    this.$connect();
  }

  withExtensions() {
    return this.$extends({
      query: {
        user: {
          update: async ({ args }) => {
            const { password } = args.data;

            if (!password || typeof password !== 'string') {
              return args;
            }

            const hashedPassword = await bcrypt.hash(
              password,
              this.configService.get('PASSWORD_HASH_SALT')
            );
            const hashedArgs = {
              ...args,
              data: {
                ...args.data,
                password: hashedPassword,
              },
            };
            return hashedArgs;
          },
        },
      },
      result: {
        user: {
          fullName: {
            compute: (user: User) =>
              `${user.lastName} ${user.firstName} ${user.patronymic ?? ''}`.trim(),
            needs: {
              firstName: true,
              lastName: true,
              patronymic: true,
            },
          },
        },
      },
    });
  }
}
