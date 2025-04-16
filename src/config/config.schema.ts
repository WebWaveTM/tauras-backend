import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import z from 'zod';

function read(filePath: string) {
  const logger = new Logger('InitConfig');
  const path = resolve(__dirname, filePath);
  try {
    return readFileSync(path, { encoding: 'utf-8' });
  } catch (error) {
    logger.error(`Error reading file at ${path}:`, error);
    throw new Error(`Failed to read file at ${path}`);
  }
}

export const ConfigSchema = z.object({
  ACCESS_EXPIRES_IN: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  ACCESS_PRIVATE_KEY: z.string().transform(read),
  ACCESS_PUBLIC_KEY: z.string().transform(read),
  APP_PORT: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0).max(65535)),
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0).max(65535)),
  DB_USER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_ISSUER: z.string(),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional()
    .default('info'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  REDIS_HOST: z.string(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_PORT: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0).max(65535)),
  REDIS_URL: z.string().url(),
  REDIS_USER: z.string().optional(),
  REFRESH_EXPIRES_IN: z
    .string()
    .transform((val) => +val)
    .pipe(z.number().int().min(0)),
  REFRESH_PRIVATE_KEY: z.string().transform(read),
  REFRESH_PUBLIC_KEY: z.string().transform(read),
});

export type ConfigSchema = Required<z.infer<typeof ConfigSchema>>;
