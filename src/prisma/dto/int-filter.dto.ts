import type { Prisma } from '@prisma/client';

import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';

export class IntFilterDto<T extends Prisma.ModelName>
  implements Prisma.IntFilter<T>
{
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  equals?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  gt?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  gte?: number;

  @IsArray({ each: true })
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  in?: number[];

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  lt?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  lte?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  not?: number;

  @IsArray({ each: true })
  @IsInt({ each: true })
  @IsOptional()
  @Type(() => Number)
  notIn?: number[];
}
