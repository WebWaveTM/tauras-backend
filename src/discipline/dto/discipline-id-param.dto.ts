import { Type } from 'class-transformer';
import { IsInt, IsNumber } from 'class-validator';

export class DisciplineIdParamDto {
  @IsInt()
  @IsNumber()
  @Type(() => Number)
  id: number;
}
