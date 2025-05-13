import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import type { Prisma } from '@prisma/client';

import type { PrismaService } from '../prisma.service';

export type FindManyArgs<TWhere, TOrderBy> = FindManyFields<TOrderBy> & {
  where?: TWhere;
};

export type FindManyFields<TOrderBy> = {
  orderBy?: TOrderBy | TOrderBy[];
  page?: number;
  recordsPerPage?: number;
};

export async function paginate<Entity, WhereInput, OrderByInput>(
  service: TransactionHost<TransactionalAdapterPrisma<PrismaService>>,
  model: Prisma.ModelName,
  params: FindManyArgs<WhereInput, OrderByInput> = {}
): Promise<{
  data: Entity[];
  isLastPage: boolean;
  page: number;
  totalPages: number;
}> {
  const { orderBy, page = 1, recordsPerPage = 10, where } = params;
  const skip = recordsPerPage * (page - 1);
  const take = recordsPerPage;
  const count = await service.tx[model].count({
    orderBy,
    skip,
    take,
    where,
  });
  const totalPages = Math.ceil(count / recordsPerPage);
  const isLastPage = page === totalPages;
  const data = await service.tx[model].findMany({ orderBy, skip, take, where });

  return { data, isLastPage, page, totalPages };
}
