import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import normalizeEmail from 'normalize-email';

import { IsUniqueField } from '~/prisma/decorators/is-unique-field.decorator';

import { SignUpPayload } from '../types/signup.payload';

export class SignUpDto implements SignUpPayload {
  @IsEmail()
  @IsString()
  @IsUniqueField('User', 'email')
  @Transform(({ value }) => normalizeEmail(value.trim()))
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  patronymic?: string;
}
