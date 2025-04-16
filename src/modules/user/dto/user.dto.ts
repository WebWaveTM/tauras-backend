import { Discipline, Role, User } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';

export class UserDto implements Partial<User> {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  lastName: string;

  @Expose()
  firstName: string;

  @Expose()
  patronymic?: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  role: Role;

  @Expose()
  @Transform(({ value }: { value: Discipline }) => value?.name ?? null)
  discipline?: null | string;

  @Expose()
  avatar: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
