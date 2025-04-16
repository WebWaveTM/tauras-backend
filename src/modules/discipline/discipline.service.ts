import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable, Logger } from '@nestjs/common';
import { Discipline, type Prisma } from '@prisma/client';

import type { PrismaService } from '~/infrastructure/database/prisma/prisma.service';

import {
  type FindManyArgs,
  paginate,
} from '~/infrastructure/database/prisma/lib/paginate';

@Injectable()
export class DisciplineService {
  private readonly logger = new Logger(DisciplineService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >
  ) {}

  async create(payload: Prisma.DisciplineCreateInput) {
    const discipline = await this.txHost.tx.discipline.create({
      data: payload,
    });
    this.logger.log(`Created discipline with id ${discipline.id}`, 'create');
    return discipline;
  }

  async update(id: number, payload: Prisma.DisciplineUpdateInput) {
    const discipline = await this.txHost.tx.discipline.update({
      data: payload,
      where: { id },
    });
    this.logger.log(`Updated discipline with id ${discipline?.id}`, 'update');
    return discipline;
  }

  async findOne(id: number) {
    const discipline = await this.txHost.tx.discipline.findUnique({
      where: { id },
    });
    this.logger.log(`Found discipline with id ${discipline?.id}`, 'findOne');
    return discipline;
  }

  async findAll(
    params?: FindManyArgs<
      Prisma.DisciplineWhereInput,
      Prisma.DisciplineOrderByWithRelationInput
    >
  ) {
    const disciplines = await paginate<
      Discipline,
      Prisma.DisciplineWhereInput,
      Prisma.DisciplineOrderByWithRelationInput
    >(this.txHost.tx, 'Discipline', params);

    this.logger.log(`Found ${disciplines.data.length} disciplines`, 'findAll');
    return disciplines;
  }

  async remove(id: number) {
    const user = await this.txHost.tx.discipline.delete({ where: { id } });

    this.logger.log(`Deleted discipline with id ${id}`, 'remove');

    return user;
  }
}
