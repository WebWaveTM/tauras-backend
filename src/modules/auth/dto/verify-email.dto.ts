import { IsString, MaxLength, MinLength } from 'class-validator';

import { PASSCODE_LENGTH } from '../email.service';

export class VerifyEmailDto {
  @IsString()
  @MaxLength(PASSCODE_LENGTH)
  @MinLength(PASSCODE_LENGTH)
  code: string;
}
