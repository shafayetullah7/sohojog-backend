import { z } from 'zod';

export const EnvConfigSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string(),
  BCRYPT_SALT_ROUND: z.string().transform(Number),
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
});
