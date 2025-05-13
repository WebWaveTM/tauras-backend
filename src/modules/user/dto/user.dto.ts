import { Discipline, Role } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';

import type { TUser } from '../types';

export class UserDto implements Partial<TUser> {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  lastName: string;

  @Expose()
  firstName: string;

  @Expose()
  fullName: string;

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

  @Expose()
  isActive: boolean;

  @Expose()
  isEmailVerified: boolean;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
