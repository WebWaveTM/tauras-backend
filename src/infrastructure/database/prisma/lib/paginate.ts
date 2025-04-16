import type { Prisma } from '@prisma/client';

export type FindManyArgs<TWhere, TOrderBy> = FindManyFields<TOrderBy> & {
  where?: TWhere;
};

export type FindManyFields<TOrderBy> = {
  orderBy?: TOrderBy | TOrderBy[];
  page?: number;
  recordsPerPage?: number;
};

export async function paginate<Entity, WhereInput, OrderByInput>(
  tx: Prisma.TransactionClient,
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
  const count = await tx[model].count({
    orderBy,
    skip,
    take,
    where,
  });
  const totalPages = Math.ceil(count / recordsPerPage);
  const isLastPage = page === totalPages;
  const data = await tx[model].findMany({ orderBy, skip, take, where });

  return { data, isLastPage, page, totalPages };
}
