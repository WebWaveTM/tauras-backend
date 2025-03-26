import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { DateTimeFilterDto } from '~/prisma/dto/date-time-filter.dto';
import {
  IsAscDesc,
  withPaginationParams,
} from '~/prisma/dto/pagination-params.dto';
import { StringFilterDto } from '~/prisma/dto/string-filter.dto';

class DisciplinesOrderByInputDto
  implements Prisma.DisciplineOrderByWithRelationInput
{
  @IsAscDesc()
  name?: Prisma.SortOrder;

  @IsAscDesc()
  createdAt?: Prisma.SortOrder;

  @IsAscDesc()
  updatedAt?: Prisma.SortOrder;
}

export class PaginationDisciplineParams
  extends withPaginationParams<Prisma.DisciplineOrderByWithRelationInput>(
    DisciplinesOrderByInputDto
  )
  implements Partial<Prisma.DisciplineWhereInput>
{
  @Type(() => StringFilterDto)
  @ValidateNested()
  name?: StringFilterDto<'Discipline'>;

  @Type(() => DateTimeFilterDto)
  @ValidateNested()
  createdAt?: DateTimeFilterDto<'User'>;

  @Type(() => DateTimeFilterDto)
  @ValidateNested()
  updatedAt?: DateTimeFilterDto<'User'>;
}
