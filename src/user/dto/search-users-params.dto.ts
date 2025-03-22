import { IsString } from 'class-validator';

export class SearchUserParams {
  @IsString()
  query?: string;
}
