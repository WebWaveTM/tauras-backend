import { applyDecorators, Type as Constructor, mixin } from '@nestjs/common';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import type { FindManyFields } from '../lib/paginate';

export const IsAscDesc = () => applyDecorators(IsIn(['asc', 'desc']));

export function withPaginationParams<TOrderBy>(OrderBySchema: Constructor) {
  @Exclude()
  class PaginatedDto implements FindManyFields<TOrderBy> {
    @Expose()
    @IsOptional()
    @Type(() => OrderBySchema)
    @ValidateNested({ each: true })
    orderBy?: TOrderBy | TOrderBy[];

    @Expose()
    @IsInt()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @Expose()
    @IsInt()
    @IsOptional()
    @Max(100)
    @Min(1)
    @Type(() => Number)
    recordsPerPage?: number;
  }

  return mixin(PaginatedDto);
}
