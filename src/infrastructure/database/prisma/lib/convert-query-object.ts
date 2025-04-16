import type { FindManyArgs, FindManyFields } from './paginate';

export const convertQueryObject = <TOrderBy, TWhere>(
  obj: FindManyFields<TOrderBy>
): FindManyArgs<TWhere, TOrderBy> => {
  const whereObj = Object.fromEntries(
    Object.entries(obj).filter(
      ([key]) => key !== 'orderBy' && key !== 'page' && key !== 'recordsPerPage'
    )
  );

  return {
    orderBy: obj.orderBy,
    page: obj.page,
    recordsPerPage: obj.recordsPerPage,
    where: whereObj as TWhere,
  };
};
