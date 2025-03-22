import { withPagination } from '~/prisma/dto/paginated.dto';

import { UserDto } from './user.dto';

export class PaginatedUsersDto extends withPagination(UserDto) {
  constructor(partial: Partial<PaginatedUsersDto>) {
    super();
    Object.assign(this, partial);
  }
}
