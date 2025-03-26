import type { Prisma } from '@prisma/client';

import bcrypt from 'bcrypt';

export async function getHashedUser(user: Prisma.UserCreateInput) {
  const { password, ...rest } = user;
  const hashedPassword = password && (await bcrypt.hash(password, 10));
  return {
    ...rest,
    password: hashedPassword,
  };
}
