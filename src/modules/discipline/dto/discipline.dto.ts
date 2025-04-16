import type { Discipline } from '@prisma/client';

import { Expose } from 'class-transformer';

export class DisciplineDto implements Partial<Discipline> {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<DisciplineDto>) {
    Object.assign(this, partial);
  }
}
