import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
