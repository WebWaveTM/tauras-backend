import type { Prisma } from '@prisma/client';

import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class StringFilterDto<T extends Prisma.ModelName>
  implements Prisma.StringFilter<T>
{
  @IsOptional()
  @IsString()
  contains?: string;

  @IsOptional()
  @IsString()
  endsWith?: string;

  @IsOptional()
  @IsString()
  equals?: string;

  @IsOptional()
  @IsString()
  gt?: string;

  @IsOptional()
  @IsString()
  gte?: string;

  @IsArray({ each: true })
  @IsOptional()
  @IsString({ each: true })
  in?: string[];

  @IsOptional()
  @IsString()
  lt?: string;

  @IsOptional()
  @IsString()
  lte?: string;

  @IsIn(['default', 'insensitive'])
  @IsOptional()
  mode?: Prisma.QueryMode;

  @IsOptional()
  @IsString()
  not?: string;

  @IsArray({ each: true })
  @IsOptional()
  @IsString({ each: true })
  notIn?: string[];

  @IsOptional()
  @IsString()
  startsWith?: string;
}
