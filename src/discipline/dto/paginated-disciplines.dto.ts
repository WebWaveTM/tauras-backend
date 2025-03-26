import { withPagination } from '~/prisma/dto/paginated.dto';

import { DisciplineDto } from './discipline.dto';

export class PaginatedDisciplinesDto extends withPagination(DisciplineDto) {
  constructor(partial: Partial<PaginatedDisciplinesDto>) {
    super();
    Object.assign(this, partial);
  }
}
