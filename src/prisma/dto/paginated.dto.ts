import { type Type as Constructor, mixin } from '@nestjs/common';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export function withPagination<TEntityDto extends Constructor>(
  Dto: TEntityDto
) {
  class PaginatedDto {
    @Expose()
    @Type(() => Dto)
    @ValidateNested({ each: true })
    data: Array<InstanceType<TEntityDto>>;

    @Expose()
    isLastPage: boolean;

    @Expose()
    page: number;

    @Expose()
    totalPages: number;
  }

  return mixin(PaginatedDto);
}
