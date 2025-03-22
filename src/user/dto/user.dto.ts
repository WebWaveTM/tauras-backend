import { Role, User } from '@prisma/client';
import { Expose } from 'class-transformer';

export class UserDto implements Partial<User> {
  @Expose()
  avatar: string;

  @Expose()
  dateOfBirth: Date;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  id: number;

  @Expose()
  lastName: string;

  @Expose()
  patronymic?: string;

  @Expose()
  role: Role;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
