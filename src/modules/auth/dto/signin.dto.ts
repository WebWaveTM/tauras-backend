import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import normalizeEmail from 'normalize-email';

export class SignInDto {
  @IsEmail()
  @IsString()
  @Transform(({ value }) => normalizeEmail(value.trim()))
  email: string;

  @IsString()
  password: string;
}
