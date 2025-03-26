import { Prisma, Role } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, ValidateNested } from 'class-validator';

import { DateTimeFilterDto } from '~/prisma/dto/date-time-filter.dto';
import {
  IsAscDesc,
  withPaginationParams,
} from '~/prisma/dto/pagination-params.dto';
import { StringFilterDto } from '~/prisma/dto/string-filter.dto';

class UsersOrderByInputDto implements Prisma.UserOrderByWithRelationInput {
  @IsAscDesc()
  dateOfBirth?: Prisma.SortOrder;

  @IsAscDesc()
  email?: Prisma.SortOrder;

  @IsAscDesc()
  firstName?: Prisma.SortOrder;

  @IsAscDesc()
  lastName?: Prisma.SortOrder;

  @IsAscDesc()
  patronymic?: Prisma.SortOrder;

  @IsAscDesc()
  role?: Prisma.SortOrder;

  @IsAscDesc()
  createdAt?: Prisma.SortOrder;

  @IsAscDesc()
  updatedAt?: Prisma.SortOrder;
}

export class PaginationUserParams
  extends withPaginationParams<Prisma.UserOrderByWithRelationInput>(
    UsersOrderByInputDto
  )
  implements Partial<Prisma.UserWhereInput>
{
  @Type(() => DateTimeFilterDto)
  @ValidateNested()
  createdAt?: DateTimeFilterDto<'User'>;

  @Type(() => DateTimeFilterDto)
  @ValidateNested()
  updatedAt?: DateTimeFilterDto<'User'>;

  @Type(() => DateTimeFilterDto)
  @ValidateNested()
  dateOfBirth?: DateTimeFilterDto<'User'>;

  @Type(() => StringFilterDto)
  @ValidateNested()
  email?: StringFilterDto<'User'>;

  @Type(() => StringFilterDto)
  @ValidateNested()
  firstName?: StringFilterDto<'User'>;

  @Type(() => StringFilterDto)
  @ValidateNested()
  lastName?: StringFilterDto<'User'>;

  @Type(() => StringFilterDto)
  @ValidateNested()
  patronymic?: StringFilterDto<'User'>;

  @IsInt()
  @Type(() => Number)
  disciplineId?: number;

  @IsEnum(Role)
  role?: Role;
}
