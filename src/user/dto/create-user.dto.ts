import { type Prisma, Role } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import normalizeEmail from 'normalize-email';

import { IsUniqueField } from '~/prisma/decorators/is-unique-field.decorator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsEmail()
  @IsUniqueField('User', 'email')
  @Transform(({ value }) => normalizeEmail(value.trim()))
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword()
  password?: string;

  @IsOptional()
  @IsString()
  patronymic?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsInt()
  @IsOptional()
  disciplineId?: number;
}
