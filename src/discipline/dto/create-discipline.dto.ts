import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDisciplineDto {
  @IsString()
  @MaxLength(255)
  @MinLength(1)
  @Transform(({ value }) => value.trim())
  name: string;
}
