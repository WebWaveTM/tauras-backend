import type { Prisma } from '@prisma/client';

import { IsArray, IsDateString, IsOptional } from 'class-validator';

export class DateTimeFilterDto<T extends Prisma.ModelName>
  implements Prisma.DateTimeFilter<T>
{
  @IsDateString()
  @IsOptional()
  equals?: string;

  @IsDateString()
  @IsOptional()
  gt?: string;

  @IsDateString()
  @IsOptional()
  gte?: string;

  @IsArray({ each: true })
  @IsDateString({ strict: true }, { each: true })
  @IsOptional()
  in?: string[];

  @IsDateString()
  @IsOptional()
  lt?: string;

  @IsDateString()
  @IsOptional()
  lte?: string;

  @IsDateString()
  @IsOptional()
  not?: string;

  @IsArray({ each: true })
  @IsDateString({ strict: true }, { each: true })
  @IsOptional()
  notIn?: string[];
}
