import type { Prisma, User } from '@prisma/client';

import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable, Logger } from '@nestjs/common';

import { type FindManyArgs, paginate } from '~/prisma/lib/paginate';
import { type PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >
  ) {}

  async create(payload: Prisma.UserCreateInput) {
    const user = await this.txHost.tx.user.create({ data: payload });
    this.logger.log(`Created user with id ${user.id}`, 'create');
    return user;
  }

  async update(id: number, payload: Prisma.UserUpdateInput) {
    const user = await this.txHost.tx.user.update({
      data: payload,
      where: { id },
    });
    this.logger.log(`Updated user with id ${id}`, 'update');
    return user;
  }

  async findOne(id: number) {
    const user = await this.txHost.tx.user.findUnique({ where: { id } });
    this.logger.log(`Found user with id ${id}`, 'findOne');
    return user;
  }

  async findAll(
    params?: FindManyArgs<
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >
  ) {
    const users = await paginate<
      User,
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >(this.txHost.tx, 'User', params);

    this.logger.log(`Found ${users.data.length} users`, 'findAll');
    return users;
  }

  async remove(id: number) {
    const user = await this.txHost.tx.user.delete({ where: { id } });

    this.logger.log(`Deleted user with id ${id}`, 'remove');

    return user;
  }

  async search(query?: string) {
    const modifiedQuery = `${query}*`;
    if (!query) {
      this.logger.log(`Found 0 users with query ${modifiedQuery}`, 'search');
      return [];
    }
    const results = await this.txHost.tx.user.findMany({
      orderBy: {
        _relevance: {
          fields: ['firstName', 'lastName', 'patronymic', 'email'],
          search: modifiedQuery,
          sort: 'desc',
        },
      },
      take: 20,
      where: {
        email: {
          mode: 'insensitive',
          search: modifiedQuery,
        },
        firstName: {
          mode: 'insensitive',
          search: modifiedQuery,
        },
        lastName: {
          mode: 'insensitive',
          search: modifiedQuery,
        },
        patronymic: {
          mode: 'insensitive',
          search: modifiedQuery,
        },
      },
    });

    this.logger.log(
      `Found ${results.length} users with query ${modifiedQuery}`,
      'search'
    );

    return results;
  }
}
