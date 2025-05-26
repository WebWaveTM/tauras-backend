import { Logger } from '@nestjs/common';
import { existsSync, readFileSync, statSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import z from 'zod';

function resolveKey(value: string, keyName: string): string {
  const logger = new Logger('InitConfig');
  if (!value) {
    logger.error(`${keyName} is not provided`);
    throw new Error(`${keyName} is not provided`);
  }

  const maybePath = isAbsolute(value) ? value : resolve(__dirname, value);
  if (existsSync(maybePath) && statSync(maybePath).isFile()) {
    try {
      return readFileSync(maybePath, { encoding: 'utf-8' });
    } catch (error) {
      logger.error(`Error reading ${keyName} at ${maybePath}:`, error);
      throw new Error(`Failed to read ${keyName} at ${maybePath}`);
    }
  }

  if (value.trim().length === 0) {
    logger.error(`${keyName} is empty`);
    throw new Error(`${keyName} is empty`);
  }
  return value;
}

const portSchema = z
  .string()
  .transform((val) => +val)
  .pipe(z.number().int().min(0).max(65535));

export const ConfigSchema = z.object({
  ACCESS_EXPIRES_IN: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  ACCESS_PRIVATE_KEY: z
    .string()
    .transform((val) => resolveKey(val, 'ACCESS_PRIVATE_KEY')),
  ACCESS_PUBLIC_KEY: z
    .string()
    .transform((val) => resolveKey(val, 'ACCESS_PUBLIC_KEY')),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  APP_PORT: portSchema,
  BASE_URL: z.string().url(),
  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(';').map((item) => item.trim()))
    .pipe(z.array(z.string().url()))
    .optional()
    .default('http://localhost:5173'),
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: portSchema,
  DB_USER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_ISSUER: z.string(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional()
    .default('info'),
  MAIL_FROM: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_PORT: portSchema,
  MAIL_SECURE: z.string().transform((val) => val === 'true'),
  MAIL_USER: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PASSWORD_HASH_SALT: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  REDIS_HOST: z.string(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_PORT: portSchema,
  REDIS_URL: z.string().url(),
  REDIS_USER: z.string().optional(),
  REFRESH_EXPIRES_IN: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  REFRESH_PRIVATE_KEY: z
    .string()
    .transform((val) => resolveKey(val, 'REFRESH_PRIVATE_KEY')),
  REFRESH_PUBLIC_KEY: z
    .string()
    .transform((val) => resolveKey(val, 'REFRESH_PUBLIC_KEY')),
  RESTORE_PASSWORD_LINK: z.string().url(),
  RESTORE_PASSWORD_TOKEN_LIFETIME: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  SECURE_COOKIE: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional()
    .default('false'),
  VERIFY_EMAIL_LINK: z.string().url(),
  VERIFY_EMAIL_PASSCODE_LIFETIME: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  VERIFY_EMAIL_PASSCODE_RESEND_RATE: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
});

export type ConfigSchema = Required<z.infer<typeof ConfigSchema>>;
