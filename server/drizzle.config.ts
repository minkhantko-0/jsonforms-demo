import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'formdata',
  },
} satisfies Config;
