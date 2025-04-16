import type { Prisma, User } from '@prisma/client';

import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable, Logger } from '@nestjs/common';

import { type FindManyArgs, paginate } from '~/prisma/lib/paginate';
import { type PrismaService } from '~/prisma/prisma.service';
import { getHashedUser } from '~/user/lib/get-hashed-user';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >
  ) {}

  async create(payload: Prisma.UserCreateInput) {
    this.logger.log('Creating a new user');
    const hashedPayload = await getHashedUser(payload);
    const user = await this.txHost.tx.user.create({
      data: hashedPayload,
    });
    this.logger.log(`User created with ID: ${user.id}`);
    return user;
  }

  async update(id: number, payload: Prisma.UserUpdateInput) {
    this.logger.log(`Updating user with ID: ${id}`);
    const user = await this.txHost.tx.user.update({
      data: payload,
      where: { id },
    });
    this.logger.log(`User with ID: ${id} updated successfully`);
    return user;
  }

  async findOne(id: number) {
    this.logger.log(`Finding user with ID: ${id}`);
    const user = await this.txHost.tx.user.findUnique({ where: { id } });
    if (!user) {
      this.logger.warn(`User with ID: ${id} not found`);
    } else {
      this.logger.log(`User with ID: ${id} found`);
    }
    return user;
  }

  async findOneByEmail(email: string) {
    this.logger.log(`Finding user with email: ${email}`);
    const user = await this.txHost.tx.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn(`User with email: ${email} not found`);
    } else {
      this.logger.log(`User with email: ${email} found`);
    }
    return user;
  }

  async findAll(
    params?: FindManyArgs<
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >
  ) {
    this.logger.log('Fetching all users with pagination');
    const users = await paginate<
      User,
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >(this.txHost.tx, 'User', params);

    this.logger.log(`Found ${users.data.length} users`);
    return users;
  }

  async remove(id: number) {
    this.logger.log(`Removing user with ID: ${id}`);
    const user = await this.txHost.tx.user.delete({ where: { id } });
    this.logger.log(`User with ID: ${id} removed successfully`);
    return user;
  }

  async search(query?: string) {
    const modifiedQuery = `${query}*`;
    this.logger.log(`Searching users with query: ${modifiedQuery}`);
    if (!query) {
      this.logger.log(`Found 0 users with query ${modifiedQuery}`);
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
      `Found ${results.length} users with query: ${modifiedQuery}`
    );
    return results;
  }
}
