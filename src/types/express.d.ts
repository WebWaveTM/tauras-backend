import type { Role } from '@prisma/client';

// Extend Express namespace to add custom properties to Request interface
declare global {
  namespace Express {
    interface Request {
      accessToken?: {
        aud: string;
        exp: number;
        iat: number;
        iss: string;
        jti: string;
        sub: number;
      };

      refreshToken?: {
        aud: string;
        exp: number;
        iat: number;
        iss: string;
        jti: string;
        sub: number;
      };
    }

    interface User {
      avatar: null | string;
      createdAt: Date;
      dateOfBirth: Date;
      disciplineId: null | number;
      email: string;
      firstName: string;
      fullName: string;
      id: number;
      isActive: boolean;
      isEmailVerified: boolean;
      lastName: string;
      password: null | string;
      patronymic: null | string;
      role: Role;
      updatedAt: Date;
    }
  }
}

export {};
